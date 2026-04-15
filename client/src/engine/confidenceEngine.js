// Confidence scoring — pure client-side, no API calls
export function scoreSlideConfidence(slide) {
  let score = 50;
  if (slide.title && slide.title.length > 10 && !/slide|untitled|placeholder/i.test(slide.title)) score += 10;
  if (slide.title && /\d/.test(slide.title)) score += 5;
  if (slide.type === 'dashboard' && slide.metrics?.length >= 4) score += 15;
  if (slide.type === 'dashboard' && slide.metrics?.length < 3) score -= 10;
  if (slide.type === 'table' && slide.headers?.length >= 3 && slide.rows?.length >= 3) score += 15;
  if (slide.type === 'table' && (!slide.rows || slide.rows.length < 2)) score -= 15;
  if (slide.type === 'content' && slide.bullets?.length >= 3) score += 10;
  if (slide.type === 'content' && slide.body && slide.body.length > 50) score += 10;
  if (slide.type === 'highlight-list' && slide.items?.length >= 3) score += 10;
  if (slide.infographic) score += 10;
  const fields = Object.values(slide).filter((v) => v !== null && v !== undefined && v !== '');
  if (fields.length < 3) score -= 20;
  return Math.max(0, Math.min(100, score));
}

export function scoreDeck(slides) {
  return slides.map((slide) => ({ ...slide, confidenceScore: scoreSlideConfidence(slide) }));
}

export function getConfidenceLabel(score) {
  if (score >= 80) return { label: 'High confidence', level: 'high', color: '#10B981' };
  if (score >= 60) return { label: 'Needs review', level: 'medium', color: '#F59E0B' };
  return { label: 'Needs improvement', level: 'low', color: '#EF4444' };
}

export function checkFailureGuardrail(totalSlides, manuallyEditedCount) {
  const ratio = totalSlides > 0 ? manuallyEditedCount / totalSlides : 0;
  return {
    exceeded: ratio > 0.2,
    ratio,
    percentage: Math.round(ratio * 100),
    message: ratio > 0.2 ? 'We can improve this deck automatically. Try Bulk AI Improve.' : null,
  };
}
