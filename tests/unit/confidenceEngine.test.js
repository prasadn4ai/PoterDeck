import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { scoreSlideConfidence, scoreDeck, getConfidenceLabel, checkFailureGuardrail } from '../../client/src/engine/confidenceEngine.js';

// Property P11: Confidence score always in [0, 100]
describe('confidenceEngine', () => {
  it('P11: scoreSlideConfidence always returns [0, 100] for any slide', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          type: fc.constantFrom('title', 'agenda', 'content', 'dashboard', 'table', 'section-overview', 'highlight-list', 'thank-you'),
          title: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
          body: fc.option(fc.string({ minLength: 0, maxLength: 500 })),
          bullets: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 10 })),
          metrics: fc.option(fc.array(fc.record({ label: fc.string(), value: fc.string(), change: fc.string(), trend: fc.constantFrom('up', 'down', 'flat') }), { minLength: 0, maxLength: 8 })),
          headers: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 10 })),
          rows: fc.option(fc.array(fc.array(fc.string(), { minLength: 1, maxLength: 5 }), { minLength: 0, maxLength: 10 })),
          items: fc.option(fc.array(fc.record({ icon: fc.string(), title: fc.string(), body: fc.string() }), { minLength: 0, maxLength: 8 })),
          infographic: fc.option(fc.constantFrom('bar-chart', 'line-chart', 'kpi-scorecard', null)),
        }),
        (slide) => {
          const score = scoreSlideConfidence(slide);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
          expect(typeof score).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('scoreDeck adds confidenceScore to each slide', () => {
    const slides = [
      { type: 'title', title: 'Test Presentation', subtitle: 'Hello' },
      { type: 'content', title: 'Revenue Growth in 2024', bullets: ['Point 1', 'Point 2', 'Point 3'] },
    ];
    const scored = scoreDeck(slides);
    expect(scored).toHaveLength(2);
    scored.forEach((s) => {
      expect(s.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(s.confidenceScore).toBeLessThanOrEqual(100);
    });
  });

  it('getConfidenceLabel returns correct levels', () => {
    expect(getConfidenceLabel(85).level).toBe('high');
    expect(getConfidenceLabel(65).level).toBe('medium');
    expect(getConfidenceLabel(40).level).toBe('low');
  });

  it('checkFailureGuardrail triggers at >20%', () => {
    expect(checkFailureGuardrail(10, 3).exceeded).toBe(true);
    expect(checkFailureGuardrail(10, 2).exceeded).toBe(false);
    expect(checkFailureGuardrail(10, 1).exceeded).toBe(false);
  });
});
