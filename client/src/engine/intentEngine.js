// intentEngine.js
// Maps user intent keywords to recommended deck types.
// Reduces decision fatigue by showing top 3 recommendations first.

const INTENT_KEYWORDS = {
  q_report:       ['quarterly', 'q1', 'q2', 'q3', 'q4', 'quarter', 'financial report', 'earnings'],
  sales_pitch:    ['sales', 'pitch', 'prospect', 'deal', 'proposal', 'sell', 'client pitch'],
  monthly_kpi:    ['monthly', 'kpi', 'metrics', 'performance', 'dashboard', 'ops review'],
  board_update:   ['board', 'executive', 'leadership', 'ceo', 'cxo', 'governance'],
  product_launch: ['launch', 'product', 'release', 'go-to-market', 'gtm', 'feature'],
  qbr:            ['qbr', 'business review', 'customer review', 'renewal', 'csm'],
  portfolio:      ['portfolio', 'capabilities', 'credentials', 'showcase', 'about us'],
};

const DECK_STYLE_MAP = {
  q_report:       'corporate',
  sales_pitch:    'bold',
  monthly_kpi:    'modern',
  board_update:   'minimal',
  product_launch: 'modern',
  qbr:            'corporate',
  portfolio:      'glass',
};

const DECK_COLOR_MAP = {
  q_report:       'blue',
  sales_pitch:    'rose',
  monthly_kpi:    'teal',
  board_update:   'purple',
  product_launch: 'amber',
  qbr:            'blue',
  portfolio:      'purple',
};

export function recommendDecks(intentText) {
  if (!intentText || intentText.trim().length === 0) return [];
  const lower = intentText.toLowerCase();
  const scores = {};

  for (const [deckId, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length; // multi-word matches score higher
    }
    if (score > 0) scores[deckId] = score;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
}

export function getRecommendedStyle(deckType) {
  return DECK_STYLE_MAP[deckType] || 'corporate';
}

export function getRecommendedColor(deckType) {
  return DECK_COLOR_MAP[deckType] || 'blue';
}

export default { recommendDecks, getRecommendedStyle, getRecommendedColor };
