import React from 'react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-16)', gap: 'var(--space-4)',
      color: 'var(--color-text-muted)',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 'var(--font-size-sm)' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
