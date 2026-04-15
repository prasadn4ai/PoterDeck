import { describe, it, expect } from 'vitest';
import { recommendDecks, getRecommendedStyle, getRecommendedColor } from '../../client/src/engine/intentEngine.js';

describe('intentEngine', () => {
  it('recommends quarterly report for Q1 intent', () => {
    const recs = recommendDecks('Q1 2025 quarterly financial report');
    expect(recs[0]).toBe('q_report');
  });

  it('recommends sales pitch for sales-related intent', () => {
    const recs = recommendDecks('sales pitch for new prospect');
    expect(recs[0]).toBe('sales_pitch');
  });

  it('recommends board update for executive intent', () => {
    const recs = recommendDecks('board executive leadership update');
    expect(recs[0]).toBe('board_update');
  });

  it('returns empty for empty input', () => {
    expect(recommendDecks('')).toEqual([]);
    expect(recommendDecks(null)).toEqual([]);
  });

  it('returns at most 3 recommendations', () => {
    const recs = recommendDecks('quarterly sales monthly kpi product launch board qbr');
    expect(recs.length).toBeLessThanOrEqual(3);
  });

  it('getRecommendedStyle returns valid style', () => {
    expect(['corporate', 'modern', 'minimal', 'glass', 'bold']).toContain(getRecommendedStyle('q_report'));
    expect(getRecommendedStyle('unknown')).toBe('corporate');
  });

  it('getRecommendedColor returns valid color', () => {
    expect(['blue', 'purple', 'teal', 'rose', 'amber']).toContain(getRecommendedColor('sales_pitch'));
  });
});
