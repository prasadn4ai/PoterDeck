import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, Database, Shield, Cpu, Check, X, Eye, EyeOff, RefreshCw, Save } from 'lucide-react';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { useUiStore } from '../../store/uiStore';

const isElectron = !!window.electronAPI;

function StatusDot({ active }) {
  return (
    <div style={{
      width: '10px', height: '10px', borderRadius: '50%',
      background: active ? '#10B981' : '#EF4444',
      flexShrink: 0,
    }} />
  );
}

function KeyInput({ label, icon: Icon, keyName, value, hasKey, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (inputVal.trim()) {
      onSave(keyName, inputVal.trim());
      setInputVal('');
      setEditing(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-4)', background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: hasKey ? '#10B98120' : 'var(--color-bg-alt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hasKey ? '#10B981' : 'var(--color-text-muted)', flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{label}</span>
          <StatusDot active={hasKey} />
          {hasKey && <Badge color="success">Configured</Badge>}
        </div>

        {editing ? (
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Enter ${label} key...`}
                autoFocus
                style={{
                  width: '100%', padding: '8px 36px 8px 10px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
              <button onClick={() => setShowKey(!showKey)} style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
              }}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!inputVal.trim()}>
              <Save size={14} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setInputVal(''); }}>
              <X size={14} />
            </Button>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {hasKey ? '••••••••••••••••' : 'Not configured'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {!editing && (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            {hasKey ? 'Update' : 'Add Key'}
          </Button>
        )}
        {hasKey && !editing && (
          <Button size="sm" variant="danger" onClick={() => onDelete(keyName)}>
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [jwtSecret, setJwtSecret] = useState('');
  const [restartNeeded, setRestartNeeded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (isElectron) {
      const s = await window.electronAPI.getSettings();
      setSettings(s);
      setSupabaseUrl(s.supabaseUrl || '');
    } else {
      // Browser mode: read from localStorage
      setSettings({
        hasGemini: !!localStorage.getItem('poterdeck_byok_gemini'),
        hasOpenai: !!localStorage.getItem('poterdeck_byok_openai'),
        hasAnthropic: !!localStorage.getItem('poterdeck_byok_anthropic'),
        hasSupabase: true, // assume configured in .env for browser mode
        hasJwt: true,
        hasAnyLLM: true,
        firstRun: false,
      });
    }
  };

  const handleSaveKey = async (keyName, value) => {
    if (isElectron) {
      await window.electronAPI.saveSettings({ [keyName]: value });
      setRestartNeeded(true);
    } else {
      // Browser: store BYOK keys in localStorage
      const lsMap = {
        googleApiKey: 'poterdeck_byok_gemini',
        openaiApiKey: 'poterdeck_byok_openai',
        anthropicApiKey: 'poterdeck_byok_anthropic',
      };
      if (lsMap[keyName]) localStorage.setItem(lsMap[keyName], value);
    }
    await loadSettings();
  };

  const handleDeleteKey = async (keyName) => {
    if (isElectron) {
      await window.electronAPI.deleteKey(keyName);
      setRestartNeeded(true);
    } else {
      const lsMap = {
        googleApiKey: 'poterdeck_byok_gemini',
        openaiApiKey: 'poterdeck_byok_openai',
        anthropicApiKey: 'poterdeck_byok_anthropic',
      };
      if (lsMap[keyName]) localStorage.removeItem(lsMap[keyName]);
    }
    await loadSettings();
  };

  const handleSaveSupabase = async () => {
    if (!isElectron) return;
    setSaving(true);
    await window.electronAPI.saveSettings({ supabaseUrl, supabaseKey: supabaseKey || undefined, jwtSecret: jwtSecret || undefined });
    setRestartNeeded(true);
    setSaving(false);
    await loadSettings();
  };

  const handleRestartApi = async () => {
    if (!isElectron) return;
    setSaving(true);
    await window.electronAPI.restartApi();
    setRestartNeeded(false);
    setSaving(false);
  };

  if (!settings) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading settings...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-8)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => setAppPhase('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          Configure your API keys and service connections. Keys are stored securely {isElectron ? 'in the app config' : 'in your browser'}.
        </p>

        {restartNeeded && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-4)', background: '#FEF3C7', borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-6)', border: '1px solid #F59E0B40',
          }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#92400E' }}>
              Settings changed. Restart API to apply.
            </span>
            <Button size="sm" onClick={handleRestartApi} disabled={saving}>
              <RefreshCw size={14} /> {saving ? 'Restarting...' : 'Restart API'}
            </Button>
          </div>
        )}

        {/* LLM API Keys (BYOK) */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Cpu size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>LLM API Keys (BYOK)</h2>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Bring Your Own Key — use your own LLM provider accounts. At least one key is required for deck generation.
            Keys are sent via HTTPS headers only, never stored on any server.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <KeyInput label="Google Gemini" icon={Key} keyName="googleApiKey"
              hasKey={settings.hasGemini} onSave={handleSaveKey} onDelete={handleDeleteKey} />
            <KeyInput label="OpenAI GPT-4o" icon={Key} keyName="openaiApiKey"
              hasKey={settings.hasOpenai} onSave={handleSaveKey} onDelete={handleDeleteKey} />
            <KeyInput label="Anthropic Claude" icon={Key} keyName="anthropicApiKey"
              hasKey={settings.hasAnthropic} onSave={handleSaveKey} onDelete={handleDeleteKey} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            marginTop: 'var(--space-3)', padding: 'var(--space-3)',
            background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
          }}>
            <Shield size={14} />
            <span>BYOK keys are stored locally and transmitted only via HTTPS headers. Never in request bodies, URLs, or logs.</span>
          </div>
        </section>

        {/* Supabase (Electron only) */}
        {isElectron && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Database size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Database (Supabase)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '4px' }}>Project URL</label>
                <input type="url" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '4px' }}>Service Role Key</label>
                <input type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder={settings.hasSupabase ? '••••••••' : 'Enter service role key'}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '4px' }}>JWT Secret</label>
                <input type="password" value={jwtSecret} onChange={(e) => setJwtSecret(e.target.value)}
                  placeholder={settings.hasJwt ? '••••••••' : 'Min 32 character random string'}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }} />
              </div>
              <Button onClick={handleSaveSupabase} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save Database Settings'}
              </Button>
            </div>
          </section>
        )}

        {/* Status overview */}
        <section>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { label: 'Database', ok: settings.hasSupabase },
              { label: 'Auth (JWT)', ok: settings.hasJwt },
              { label: 'LLM Provider', ok: settings.hasAnyLLM || settings.hasGemini || settings.hasOpenai || settings.hasAnthropic },
              { label: 'App Mode', ok: true, text: isElectron ? 'Desktop' : 'Browser' },
            ].map((s) => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)', background: 'var(--color-surface)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              }}>
                {s.ok ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {s.text || (s.ok ? 'Connected' : 'Not configured')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
