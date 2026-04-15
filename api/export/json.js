import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { deck } = req.body || {};
  if (!deck) return res.status(422).json({ error: 'deck required', code: 'VALIDATION_FAILED' });

  return res.status(200).json({ deck });
}
