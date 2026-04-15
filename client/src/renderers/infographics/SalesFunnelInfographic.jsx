import React from 'react';

const DEFAULT_STAGES = [
  { label: 'Leads', value: 1000 }, { label: 'Qualified', value: 600 },
  { label: 'Proposal', value: 300 }, { label: 'Closed', value: 120 },
];

export function SalesFunnelInfographic({ data, colors }) {
  const stages = data?.stages || DEFAULT_STAGES;
  const maxVal = Math.max(...stages.map((s) => s.value || 1));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '10px 0' }}>
      {stages.map((s, i) => {
        const widthPct = ((s.value / maxVal) * 100);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '80px', fontSize: '11px', fontWeight: 600, textAlign: 'right', color: colors?.textMuted }}>{s.label}</div>
            <div style={{ flex: 1, height: '28px', background: colors?.primary + '10', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${widthPct}%`, height: '100%',
                background: `linear-gradient(90deg, ${colors?.primary} 0%, ${colors?.primaryLight} 100%)`,
                borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '8px',
              }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>{s.value?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
