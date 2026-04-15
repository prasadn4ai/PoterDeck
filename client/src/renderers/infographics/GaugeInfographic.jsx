import React from 'react';

export function GaugeInfographic({ data, colors }) {
  const value = data?.value ?? 72;
  const min = data?.min ?? 0;
  const max = data?.max ?? 100;
  const label = data?.label || 'Score';
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = pct * 180;
  const r = 80;
  const cx = 100;
  const cy = 100;

  const toXY = (deg) => {
    const rad = (deg - 180) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const end = toXY(angle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={colors?.primary + '20'} strokeWidth="14" strokeLinecap="round" />
        {/* Value arc */}
        {pct > 0 && (
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none" stroke={colors?.primary} strokeWidth="14" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="700" fill={colors?.text}>
          {value}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill={colors?.textMuted}>
          {label}
        </text>
      </svg>
    </div>
  );
}
