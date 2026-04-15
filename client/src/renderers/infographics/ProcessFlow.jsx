import React from 'react';
import { ArrowRight } from 'lucide-react';

const DEFAULT_STEPS = [
  { label: 'Discovery' }, { label: 'Design' }, { label: 'Build' }, { label: 'Deploy' },
];

export function ProcessFlow({ data, colors }) {
  const steps = data?.steps || DEFAULT_STEPS;
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '20px 0', gap: '8px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{
            flex: 1, padding: '16px 12px', background: colors?.primary + '12',
            borderRadius: '10px', textAlign: 'center', border: `1px solid ${colors?.primary}25`,
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', background: colors?.primary,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 8px', fontSize: '12px', fontWeight: 700,
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600 }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && <ArrowRight size={16} style={{ color: colors?.primary, flexShrink: 0 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}
