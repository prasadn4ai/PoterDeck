import React from 'react';

export function ThankYouRenderer({ slide, typo, spacing, colors }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
      padding: spacing.outerPad,
    }}>
      <h2 style={{ fontSize: typo.titleSize, fontWeight: typo.titleWeight, color: '#fff', lineHeight: 1.2 }}>
        {slide.title || 'Thank You'}
      </h2>
      {slide.subtitle && (
        <p style={{ fontSize: typo.headingSize, color: 'rgba(255,255,255,0.8)', marginTop: '20px' }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}
