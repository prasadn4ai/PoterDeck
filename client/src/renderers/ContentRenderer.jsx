import React from 'react';
import { InfographicRenderer } from './infographics/InfographicRenderer';

export function ContentRenderer({ slide, typo, spacing, colors }) {
  const hasInfographic = !!slide.infographic;
  return (
    <div style={{
      width: '100%', height: '100%', padding: spacing.outerPad,
      display: 'flex', flexDirection: hasInfographic ? 'row' : 'column', gap: spacing.gap,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: typo.headingSize, fontWeight: typo.headingWeight, color: colors.primary, marginBottom: '12px' }}>
          {slide.title}
        </h2>
        {slide.bigStat && (
          <div style={{ fontSize: typo.metricSize, fontWeight: typo.metricWeight, color: colors.primary, marginBottom: '12px' }}>
            {slide.bigStat}
          </div>
        )}
        {slide.body && (
          <p style={{ fontSize: typo.bodySize, fontWeight: typo.bodyWeight, color: colors.textMuted, lineHeight: 1.6, marginBottom: '12px' }}>
            {slide.body}
          </p>
        )}
        {slide.bullets?.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slide.bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: typo.bodySize }}>
                <span style={{ color: colors.primary, fontWeight: 700, flexShrink: 0 }}>&#9679;</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hasInfographic && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InfographicRenderer type={slide.infographic} data={slide.infographicData} colors={colors} />
        </div>
      )}
    </div>
  );
}
