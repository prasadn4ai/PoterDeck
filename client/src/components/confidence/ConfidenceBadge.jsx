import React from 'react';
import { getConfidenceLabel } from '../../engine/confidenceEngine';

export function ConfidenceBadge({ score }) {
  const { label, color } = getConfidenceLabel(score);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: 'var(--radius-full)',
      background: color + '15', fontSize: 'var(--font-size-xs)', fontWeight: 600,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      <span style={{ color }}>{score}</span>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  );
}
