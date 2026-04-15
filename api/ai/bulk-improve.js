import { requireAuth } from '../../lib/auth.js';
import { getEditSlidePrompt } from '../../lib/promptBuilder.js';
import { validateSingleSlide } from '../../lib/responseValidator.js';
import { extractByokKeys, routeLLM, callProvider } from '../../lib/llmRouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { slides, nonApprovedIndices, style, colorTheme, intent } = req.body || {};
  if (!slides || !nonApprovedIndices) return res.status(422).json({ error: 'slides and nonApprovedIndices required', code: 'VALIDATION_FAILED' });

  const byokKeys = extractByokKeys(req);
  const systemKeys = { gemini: process.env.GOOGLE_API_KEY || null, gpt4o: process.env.OPENAI_API_KEY || null, claude: process.env.ANTHROPIC_API_KEY || null };

  let route;
  try { route = routeLLM(byokKeys, systemKeys); } catch {
    return res.status(503).json({ error: 'No AI provider available', code: 'NO_PROVIDER_AVAILABLE' });
  }

  const improved = [];
  const failedIndices = [];

  for (const idx of nonApprovedIndices) {
    try {
      const slide = slides[idx];
      if (!slide) { failedIndices.push(idx); continue; }
      const prompt = getEditSlidePrompt({ slide, instruction: `Improve this slide. Make it more professional, executive-quality. Context: ${intent || ''}`, style, colorTheme });
      const result = await callProvider(route.provider, route.key, prompt);
      const updatedSlide = validateSingleSlide(result.content);
      improved.push({ ...updatedSlide, id: slide.id });
    } catch {
      failedIndices.push(idx);
    }
  }

  const status = failedIndices.length > 0 && improved.length > 0 ? 207 : failedIndices.length === nonApprovedIndices.length ? 500 : 200;
  return res.status(status).json({ improvedSlides: improved, failedIndices, model_tier: route.tier });
}
