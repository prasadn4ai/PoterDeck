import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../lib/auth.js';
import { getDeckSystemPrompt } from '../../lib/promptBuilder.js';
import { validateSlideResponse } from '../../lib/responseValidator.js';
import { extractByokKeys, routeLLM, callProvider } from '../../lib/llmRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { sessionId, deckType, style, colorTheme, intent, slideSequence } = req.body || {};
  if (!intent || !deckType) return res.status(422).json({ error: 'Missing required fields', code: 'VALIDATION_FAILED' });

  try {
    const prompt = getDeckSystemPrompt({ intent, deckType, style, colorTheme, slideSequence: slideSequence || [], isRegeneration: true });
    const byokKeys = extractByokKeys(req);
    const systemKeys = { gemini: process.env.GOOGLE_API_KEY || null, gpt4o: process.env.OPENAI_API_KEY || null, claude: process.env.ANTHROPIC_API_KEY || null };
    const route = routeLLM(byokKeys, systemKeys);
    const startTime = Date.now();
    const result = await callProvider(route.provider, route.key, prompt);
    const slides = validateSlideResponse(result.content);

    return res.status(200).json({
      slides, model: route.provider, slideCount: slides.length,
      generationTimeMs: Date.now() - startTime, requestId: uuidv4(), model_tier: route.tier,
    });
  } catch (err) {
    if (err.message === 'NO_PROVIDER_AVAILABLE') return res.status(503).json({ error: 'No AI provider available', code: 'NO_PROVIDER_AVAILABLE' });
    return res.status(500).json({ error: 'Regeneration failed: ' + err.message, code: 'GENERATION_FAILED', retryable: true });
  }
}
