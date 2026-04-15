import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';
import { getDeckSystemPrompt } from '../../lib/promptBuilder.js';
import { validateSlideResponse } from '../../lib/responseValidator.js';
import { extractByokKeys, routeLLM, callProvider } from '../../lib/llmRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { intent, deckType, style, colorTheme, slideSequence } = req.body || {};

  if (!intent || intent.length < 10) {
    return res.status(422).json({ error: 'Intent must be at least 10 characters', code: 'VALIDATION_FAILED' });
  }
  if (!deckType || !style || !colorTheme) {
    return res.status(422).json({ error: 'Missing required fields: deckType, style, colorTheme', code: 'VALIDATION_FAILED' });
  }

  try {
    // Tier limit check
    const { data: userData } = await supabase
      .from('users')
      .select('monthly_deck_count, max_decks_per_month, max_slides_per_deck')
      .eq('id', user.sub)
      .single();

    if (userData && userData.monthly_deck_count >= userData.max_decks_per_month) {
      return res.status(429).json({ error: 'Monthly deck limit reached', code: 'DECK_LIMIT_EXCEEDED' });
    }

    const requestId = uuidv4();
    const sessionId = uuidv4();
    const startTime = Date.now();

    // Build prompt
    const sequence = slideSequence || [];
    const prompt = getDeckSystemPrompt({
      intent,
      deckType,
      style,
      colorTheme,
      slideSequence: sequence,
      isRegeneration: false,
    });

    // Route to LLM
    const byokKeys = extractByokKeys(req);
    const systemKeys = {
      gemini: process.env.GOOGLE_API_KEY || null,
      gpt4o: process.env.OPENAI_API_KEY || null,
      claude: process.env.ANTHROPIC_API_KEY || null,
    };

    // Try providers with fallback on failure
    const providers = ['gemini', 'gpt4o', 'claude'];
    let result = null;
    let route = null;

    for (const providerName of providers) {
      const key = byokKeys[providerName] || systemKeys[providerName];
      if (!key) continue;
      try {
        const tier = providerName === providers[0] ? 'primary' : 'fallback';
        result = await callProvider(providerName, key, prompt);
        route = { provider: providerName, key, tier };
        break;
      } catch (err) {
        console.log(`[LLM] ${providerName} failed: ${err.message.slice(0, 100)}, trying next...`);
      }
    }

    if (!result || !route) {
      return res.status(503).json({ error: 'All AI providers failed', code: 'NO_PROVIDER_AVAILABLE' });
    }

    // Validate response
    const slides = validateSlideResponse(result.content, sequence.length);

    const generationTimeMs = Date.now() - startTime;

    // Increment deck count
    try {
      await supabase.from('users')
        .update({ monthly_deck_count: (userData?.monthly_deck_count || 0) + 1 })
        .eq('id', user.sub);
    } catch (e) { console.error('Deck count increment failed:', e.message); }

    // Record analytics (non-blocking)
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'deck_created',
        user_id: user.sub,
        provider: route.provider,
        key_type: byokKeys[route.provider] ? 'byok' : 'system',
        slide_count: slides.length,
        latency_ms: generationTimeMs,
      });
    } catch (e) { console.error('Analytics insert failed:', e.message); }

    return res.status(200).json({
      slides,
      model: route.provider,
      slideCount: slides.length,
      generationTimeMs,
      requestId,
      sessionId,
      model_tier: route.tier,
    });
  } catch (err) {
    console.error('Generation error:', err.message);
    return res.status(500).json({
      error: 'Deck generation failed: ' + err.message,
      code: 'GENERATION_FAILED',
      retryable: true,
    });
  }
}
