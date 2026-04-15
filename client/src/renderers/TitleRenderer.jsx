import React from 'react';

export function TitleRenderer({ slide, typo, spacing, colors }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      padding: spacing.outerPad, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    }}>
      <h1 style={{ fontSize: typo.titleSize, fontWeight: typo.titleWeight, color: '#fff', lineHeight: 1.2, maxWidth: '80%' }}>
        {slide.title || 'Untitled'}
      </h1>
      {slide.subtitle && (
        <p style={{ fontSize: typo.headingSize, fontWeight: '400', color: 'rgba(255,255,255,0.85)', marginTop: '16px', maxWidth: '70%' }}>
          {slide.subtitle}
        </p>
      )}
      {(slide.date || slide.author) && (
        <p style={{ fontSize: typo.bodySize, color: 'rgba(255,255,255,0.6)', marginTop: '32px' }}>
          {[slide.author, slide.date].filter(Boolean).join(' | ')}
        </p>
      )}
    </div>
  );
}
