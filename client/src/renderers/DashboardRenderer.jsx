import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function DashboardRenderer({ slide, typo, spacing, colors }) {
  const metrics = slide.metrics || [];
  const cols = metrics.length <= 3 ? metrics.length : metrics.length <= 4 ? 2 : 3;
  return (
    <div style={{ width: '100%', height: '100%', padding: spacing.outerPad, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: typo.headingSize, fontWeight: typo.headingWeight, color: colors.primary, marginBottom: spacing.gap }}>
        {slide.title}
      </h2>
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '16px', alignContent: 'center',
      }}>
        {metrics.map((m, i) => {
          const trendIcon = m.trend === 'up' ? <TrendingUp size={16} /> : m.trend === 'down' ? <TrendingDown size={16} /> : <Minus size={16} />;
          const trendColor = m.trend === 'up' ? '#10B981' : m.trend === 'down' ? '#EF4444' : colors.textMuted;
          return (
            <div key={i} style={{
              background: colors.surface, borderRadius: '12px', padding: '20px',
              border: `1px solid ${colors.primary}20`,
            }}>
              <div style={{ fontSize: typo.labelSize, fontWeight: 600, color: colors.textMuted, textTransform: typo.labelUppercase ? 'uppercase' : 'none', letterSpacing: typo.labelUppercase ? '0.05em' : '0', marginBottom: '8px' }}>
                {m.label}
              </div>
              <div style={{ fontSize: typo.metricSize, fontWeight: typo.metricWeight, color: colors.text, lineHeight: 1 }}>
                {m.value}
              </div>
              {m.change && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: trendColor, fontSize: '13px', fontWeight: 600 }}>
                  {trendIcon} {m.change}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
