import React, { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const clearToast = useUiStore((s) => s.clearToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const bgMap = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-primary)',
  };

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
      background: bgMap[toast.type] || bgMap.info,
      color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 500,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideInRight 0.3s ease',
      maxWidth: '360px',
    }}>
      {toast.message}
    </div>
  );
}
