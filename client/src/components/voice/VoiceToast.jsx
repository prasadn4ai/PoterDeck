import React, { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';

export function VoiceToast() {
  const lastVoiceCommand = useUiStore((s) => s.lastVoiceCommand);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastVoiceCommand) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastVoiceCommand]);

  if (!visible || !lastVoiceCommand) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '90px', right: '24px', zIndex: 100,
      padding: '12px 20px', background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)', maxWidth: '300px',
      fontSize: 'var(--font-size-sm)', animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Voice Command:</div>
      <div style={{ fontWeight: 600 }}>"{lastVoiceCommand}"</div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
