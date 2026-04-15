import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DEFAULT_METRICS = [
  { label: 'Revenue', value: '$2.4M', change: '+18%', trend: 'up' },
  { label: 'Users', value: '12,540', change: '+7%', trend: 'up' },
  { label: 'Churn', value: '2.1%', change: '-0.3%', trend: 'down' },
];

export function KPIScorecard({ data, colors }) {
  const metrics = data?.metrics || DEFAULT_METRICS;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: colors?.surface || '#fff',
          borderRadius: '8px', border: `1px solid ${(colors?.primary || '#2563EB') + '15'}`,
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: colors?.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: colors?.text }}>{m.value}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: m.trend === 'up' ? '#10B981' : '#EF4444', fontSize: '13px', fontWeight: 600 }}>
            {m.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {m.change}
          </div>
        </div>
      ))}
    </div>
  );
}
