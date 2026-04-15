import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../../services/apiService';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI GPT-4o' },
  { id: 'anthropic', label: 'Anthropic Claude' },
];

export function LLMKeyConfig() {
  const [status, setStatus] = useState({ gemini: false, openai: false, anthropic: false });

  useEffect(() => {
    api.get('/admin/llm-keys').then(({ data }) => setStatus(data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>System LLM Keys</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
        In Beta, system keys are configured via Vercel environment variables.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {PROVIDERS.map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-4)', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.label}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {status[p.id] ? '●●●●●●●● configured' : 'Not configured'}
              </div>
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: status[p.id] ? 'var(--color-success)' : 'var(--color-border)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {status[p.id] ? <Check size={14} /> : <X size={14} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
