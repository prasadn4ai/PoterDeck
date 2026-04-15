import React from 'react';

const colorMap = {
  default: { bg: 'var(--color-bg-alt)', color: 'var(--color-text-muted)' },
  primary: { bg: 'var(--color-primary)', color: '#fff' },
  success: { bg: 'var(--color-success)', color: '#fff' },
  warning: { bg: 'var(--color-warning)', color: '#fff' },
  error: { bg: 'var(--color-error)', color: '#fff' },
};

export function Badge({ children, color = 'default', style: styleProp }) {
  const c = colorMap[color] || colorMap.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
      padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)', fontWeight: 600,
      background: c.bg, color: c.color,
      ...styleProp,
    }}>
      {children}
    </span>
  );
}
