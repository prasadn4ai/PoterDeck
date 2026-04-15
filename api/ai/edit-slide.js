import { requireAuth } from '../../lib/auth.js';
import { getEditSlidePrompt } from '../../lib/promptBuilder.js';
import { validateSingleSlide } from '../../lib/responseValidator.js';
import { extractByokKeys, routeLLM, callProvider } from '../../lib/llmRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { slide, instruction, style, colorTheme } = req.body || {};
  if (!slide || !instruction) return res.status(422).json({ error: 'slide and instruction required', code: 'VALIDATION_FAILED' });

  try {
    const prompt = getEditSlidePrompt({ slide, instruction, style, colorTheme });
    const byokKeys = extractByokKeys(req);
    const systemKeys = { gemini: process.env.GOOGLE_API_KEY || null, gpt4o: process.env.OPENAI_API_KEY || null, claude: process.env.ANTHROPIC_API_KEY || null };
    const route = routeLLM(byokKeys, systemKeys);
    const result = await callProvider(route.provider, route.key, prompt);
    const updatedSlide = validateSingleSlide(result.content);

    return res.status(200).json({ slide: { ...updatedSlide, id: slide.id }, model_tier: route.tier });
  } catch (err) {
    if (err.message === 'NO_PROVIDER_AVAILABLE') return res.status(503).json({ error: 'No AI provider available', code: 'NO_PROVIDER_AVAILABLE' });
    return res.status(500).json({ error: 'Edit failed: ' + err.message, code: 'EDIT_FAILED', retryable: true });
  }
}
