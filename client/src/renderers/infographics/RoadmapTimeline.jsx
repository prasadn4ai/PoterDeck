import React from 'react';

const DEFAULT_MILESTONES = [
  { label: 'Research', date: 'Q1', done: true },
  { label: 'Design', date: 'Q2', done: true },
  { label: 'Build', date: 'Q3', done: false },
  { label: 'Launch', date: 'Q4', done: false },
];

export function RoadmapTimeline({ data, colors }) {
  const milestones = data?.milestones || DEFAULT_MILESTONES;
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '20px 0' }}>
      {milestones.map((m, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: m.done ? colors?.primary : colors?.primary + '30',
              border: `2px solid ${colors?.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: m.done ? '#fff' : colors?.primary, fontSize: '12px', fontWeight: 700,
            }}>
              {m.done ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', textAlign: 'center' }}>{m.label}</div>
            <div style={{ fontSize: '10px', color: colors?.textMuted, marginTop: '2px' }}>{m.date}</div>
          </div>
          {i < milestones.length - 1 && (
            <div style={{ height: '2px', flex: 0.5, background: m.done ? colors?.primary : colors?.primary + '30' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
