import React, { useState } from 'react';
import { Button } from '../shared/Button';
import { useUiStore } from '../../store/uiStore';
import { useDeckStore } from '../../store/deckStore';
import { login as apiLogin } from '../../services/apiService';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const setAuthMode = useUiStore((s) => s.setAuthMode);
  const setToken = useDeckStore((s) => s.setToken);
  const setUser = useDeckStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiLogin(email, password);
      localStorage.setItem('poterdeck_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAppPhase('landing');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', padding: 'var(--space-10)',
        background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
            PoterDeck
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', padding: '0.625rem 0.875rem',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)', color: 'var(--color-text)',
                outline: 'none', transition: 'var(--transition-fast)',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              style={{
                width: '100%', padding: '0.625rem 0.875rem',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)', color: 'var(--color-text)',
                outline: 'none', transition: 'var(--transition-fast)',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={loading} size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => setAuthMode('register')}
            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
