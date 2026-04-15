import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, width = '480px' }) {
  useEffect(() => {
    if (isOpen) {
      const handler = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)', width, maxWidth: '90vw', maxHeight: '85vh',
        overflow: 'auto', padding: 'var(--space-8)',
      }}>
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none', border: 'none', fontSize: '1.5rem',
                color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem',
              }}
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
