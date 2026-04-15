import { requireAdmin } from '../../lib/auth.js';

// In Beta, system keys are stored in environment variables
// This endpoint returns presence indicators only — never key values
export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return res.status(200).json({
      gemini: !!process.env.GOOGLE_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    });
  }

  // PUT and DELETE would manage encrypted key storage in production
  // For Beta with Vercel env vars, keys are managed via Vercel dashboard
  if (req.method === 'PUT') {
    return res.status(200).json({ ok: true, message: 'In Beta, configure LLM keys via Vercel environment variables' });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ ok: true, message: 'In Beta, remove LLM keys via Vercel environment variables' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
