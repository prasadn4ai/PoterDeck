import { describe, it, expect } from 'vitest';
import { selectLayout, getTypography, getSpacing, getColorTheme, TYPOGRAPHY, SPACING, COLOR_THEMES } from '../../client/src/engine/designEngine.js';

describe('designEngine', () => {
  it('selectLayout returns a valid layout for each slide type', () => {
    const types = ['title', 'agenda', 'content', 'dashboard', 'table', 'section-overview', 'highlight-list', 'thank-you'];
    const styles = ['corporate', 'modern', 'minimal', 'glass', 'bold'];

    for (const type of types) {
      for (const style of styles) {
        const layout = selectLayout({ type }, style);
        expect(layout).toBeTruthy();
        expect(typeof layout).toBe('string');
      }
    }
  });

  it('getTypography returns valid typography for all styles', () => {
    for (const style of Object.keys(TYPOGRAPHY)) {
      const t = getTypography(style);
      expect(t.titleSize).toBeTruthy();
      expect(t.titleFont).toBeTruthy();
    }
  });

  it('getSpacing returns valid spacing for all styles', () => {
    for (const style of Object.keys(SPACING)) {
      const s = getSpacing(style);
      expect(s.outerPad).toBeTruthy();
      expect(s.gap).toBeTruthy();
    }
  });

  it('getColorTheme returns valid colors for all themes', () => {
    for (const theme of Object.keys(COLOR_THEMES)) {
      const c = getColorTheme(theme);
      expect(c.primary).toMatch(/^#/);
      expect(c.text).toBeTruthy();
    }
  });

  it('getTypography falls back to corporate for unknown', () => {
    expect(getTypography('unknown')).toEqual(TYPOGRAPHY.corporate);
  });
});
