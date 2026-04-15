import { requireAuth } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, status, max_decks_per_month, max_slides_per_deck, monthly_deck_count, created_at')
      .eq('id', auth.sub)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        pricingTier: {
          maxDecksPerMonth: user.max_decks_per_month,
          maxSlidesPerDeck: user.max_slides_per_deck,
        },
        monthlyDeckCount: user.monthly_deck_count,
      },
    });
  } catch (err) {
    console.error('Me endpoint error:', err.message);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}
