import React from 'react';

export function SectionOverviewRenderer({ slide, typo, spacing, colors }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: spacing.outerPad,
      background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}20 100%)`,
      borderLeft: `6px solid ${colors.primary}`,
    }}>
      <h2 style={{ fontSize: typo.titleSize, fontWeight: typo.titleWeight, color: colors.primary, lineHeight: 1.2 }}>
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p style={{ fontSize: typo.headingSize, fontWeight: '400', color: colors.textMuted, marginTop: '16px' }}>
          {slide.subtitle}
        </p>
      )}
      {slide.body && (
        <p style={{ fontSize: typo.bodySize, color: colors.textMuted, marginTop: '20px', lineHeight: 1.6, maxWidth: '80%' }}>
          {slide.body}
        </p>
      )}
    </div>
  );
}
