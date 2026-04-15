import { requireAuth } from '../../lib/auth.js';
import { getMaskedCount } from '../../lib/privacyService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const sessionId = req.query?.sessionId;
  if (!sessionId) return res.status(422).json({ error: 'sessionId required', code: 'VALIDATION_FAILED' });

  try {
    const result = await getMaskedCount(sessionId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
  }
}
