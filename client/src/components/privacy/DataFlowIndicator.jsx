import React from 'react';
import { Shield, Eye, EyeOff, Server } from 'lucide-react';

export function DataFlowIndicator() {
  const items = [
    { icon: EyeOff, label: 'Sensitive data auto-masked', desc: 'Names, emails, numbers replaced with tokens before AI' },
    { icon: Server, label: 'AI sees only masked data', desc: 'Real values never sent to LLM providers' },
    { icon: Shield, label: 'MaskMap stays server-side', desc: 'Token-to-value mapping never sent to browser' },
    { icon: Eye, label: 'One-click real data injection', desc: 'Replace tokens with real values after review' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>How Your Data Flows</h3>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.label}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{item.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
