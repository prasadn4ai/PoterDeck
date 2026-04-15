import { requireAdmin } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 20;
    const offset = (page - 1) * limit;

    const { data: users, count } = await supabase
      .from('users')
      .select('id, email, role, status, monthly_deck_count, max_decks_per_month, max_slides_per_deck, created_at', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    return res.status(200).json({ users: users || [], total: count || 0, page });
  }

  if (req.method === 'PATCH') {
    const userId = req.query?.id;
    if (!userId) return res.status(422).json({ error: 'User ID required' });
    if (userId === user.sub) return res.status(403).json({ error: 'Cannot modify your own account', code: 'SELF_MODIFICATION' });

    const updates = {};
    const { status, role, pricingTier } = req.body || {};
    if (status) updates.status = status;
    if (role) updates.role = role;
    if (pricingTier?.maxDecksPerMonth) updates.max_decks_per_month = pricingTier.maxDecksPerMonth;
    if (pricingTier?.maxSlidesPerDeck) updates.max_slides_per_deck = pricingTier.maxSlidesPerDeck;

    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    return res.status(200).json({ user: data });
  }

  if (req.method === 'DELETE') {
    const userId = req.query?.id;
    if (!userId) return res.status(422).json({ error: 'User ID required' });
    if (userId === user.sub) return res.status(403).json({ error: 'Cannot delete your own account', code: 'SELF_MODIFICATION' });

    await supabase.from('users').delete().eq('id', userId);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
