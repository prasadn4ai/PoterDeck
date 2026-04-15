import React from 'react';

export function AgendaRenderer({ slide, typo, spacing, colors }) {
  const items = slide.items || [];
  return (
    <div style={{ width: '100%', height: '100%', padding: spacing.outerPad, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: typo.headingSize, fontWeight: typo.headingWeight, color: colors.primary, marginBottom: spacing.gap }}>
        {slide.title || 'Agenda'}
      </h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: colors.primary,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: typo.bodySize, fontWeight: '500' }}>
              {typeof item === 'string' ? item : item.title || item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
