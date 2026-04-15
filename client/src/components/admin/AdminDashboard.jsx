import React, { useState } from 'react';
import { Users, Key, BarChart3, ArrowLeft } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { UserManagement } from './UserManagement';
import { LLMKeyConfig } from './LLMKeyConfig';
import { Analytics } from './Analytics';

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'keys', label: 'LLM Keys', icon: Key },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const setAppPhase = useUiStore((s) => s.setAppPhase);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <button onClick={() => setAppPhase('viewer')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', background: 'var(--color-bg-alt)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-sm)', fontWeight: 600,
                }}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>
      <div style={{ padding: 'var(--space-6)' }}>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'keys' && <LLMKeyConfig />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}
