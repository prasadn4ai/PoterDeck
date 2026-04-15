import React from 'react';

export function TableRenderer({ slide, typo, spacing, colors }) {
  const headers = slide.headers || [];
  const rows = slide.rows || [];
  return (
    <div style={{ width: '100%', height: '100%', padding: spacing.outerPad, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: typo.headingSize, fontWeight: typo.headingWeight, color: colors.primary, marginBottom: spacing.gap }}>
        {slide.title}
      </h2>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typo.bodySize }}>
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', padding: '10px 14px',
                    background: colors.primary, color: '#fff',
                    fontWeight: 600, fontSize: typo.labelSize,
                    textTransform: typo.labelUppercase ? 'uppercase' : 'none',
                    letterSpacing: typo.labelUppercase ? '0.05em' : '0',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? colors.surface : colors.bg }}>
                {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.primary}15` }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
