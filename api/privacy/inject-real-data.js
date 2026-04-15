import { requireAuth } from '../../lib/auth.js';
import { injectRealData } from '../../lib/privacyService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { sessionId, slides } = req.body || {};
  if (!sessionId || !slides) return res.status(422).json({ error: 'sessionId and slides required', code: 'VALIDATION_FAILED' });

  try {
    const unmaskedSlides = await injectRealData(sessionId, slides);
    return res.status(200).json({ slides: unmaskedSlides });
  } catch (err) {
    if (err.status === 410) return res.status(410).json({ error: err.message, code: 'MASKMAP_EXPIRED' });
    return res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
  }
}
