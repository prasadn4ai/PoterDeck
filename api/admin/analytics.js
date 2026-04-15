import { requireAdmin } from '../../lib/auth.js';
import { getAnalytics } from '../../lib/analyticsService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAdmin(req, res);
  if (!user) return;

  const from = req.query?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const to = req.query?.to || new Date().toISOString();

  try {
    const analytics = await getAnalytics({ from, to });
    return res.status(200).json(analytics);
  } catch (err) {
    return res.status(500).json({ error: 'Analytics failed: ' + err.message, code: 'INTERNAL_ERROR' });
  }
}
