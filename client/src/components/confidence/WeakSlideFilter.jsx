import React from 'react';
import { useViewerStore } from '../../store/viewerStore';

export function WeakSlideFilter() {
  const filter = useViewerStore((s) => s.confidenceFilter);
  const setFilter = useViewerStore((s) => s.setConfidenceFilter);
  const options = [
    { id: 'all', label: 'All' },
    { id: 'weak', label: 'Weak (<70)' },
    { id: 'needs-review', label: 'Needs Review' },
  ];

  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => setFilter(o.id)}
          style={{
            padding: '4px 10px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            background: filter === o.id ? 'var(--color-primary)' : 'transparent',
            color: filter === o.id ? '#fff' : 'var(--color-text-muted)',
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
