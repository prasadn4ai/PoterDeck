import React from 'react';

const DEFAULT_ITEMS = [
  { label: 'Market risk', impact: 'high', likelihood: 'medium' },
  { label: 'Tech debt', impact: 'medium', likelihood: 'high' },
  { label: 'Compliance', impact: 'high', likelihood: 'low' },
];

const POS = { low: 0, medium: 1, high: 2 };

export function RiskMatrix({ data, colors }) {
  const items = data?.items || DEFAULT_ITEMS;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr 30px', gap: '2px', height: '200px' }}>
        <div style={{ gridRow: '1/4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10px', color: colors?.textMuted, fontWeight: 600 }}>IMPACT</span>
        </div>
        {[2, 1, 0].map((row) =>
          [0, 1, 2].map((col) => {
            const severity = row + col;
            const bg = severity >= 3 ? '#FEE2E2' : severity >= 2 ? '#FEF3C7' : '#DCFCE7';
            const matching = items.filter((it) => POS[it.impact] === row && POS[it.likelihood] === col);
            return (
              <div key={`${row}-${col}`} style={{
                background: bg, borderRadius: '4px', padding: '4px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                fontSize: '9px', textAlign: 'center', gap: '2px',
              }}>
                {matching.map((m, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '3px', padding: '2px 4px', fontWeight: 600, fontSize: '8px' }}>{m.label}</div>
                ))}
              </div>
            );
          })
        )}
        <div />
        {['Low', 'Med', 'High'].map((l) => (
          <div key={l} style={{ textAlign: 'center', fontSize: '10px', color: colors?.textMuted, fontWeight: 600 }}>{l}</div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px', color: colors?.textMuted, fontWeight: 600, marginTop: '4px' }}>LIKELIHOOD</div>
    </div>
  );
}
