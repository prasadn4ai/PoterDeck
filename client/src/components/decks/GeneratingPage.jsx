import React, { useEffect } from 'react';
import { Loader, Shield } from 'lucide-react';
import { Button } from '../shared/Button';
import { useDeckStore } from '../../store/deckStore';
import { useUiStore } from '../../store/uiStore';
import { useGeneration } from '../../hooks/useGeneration';

export function GeneratingPage() {
  const { generate } = useGeneration();
  const isGenerating = useDeckStore((s) => s.isGenerating);
  const generationStep = useDeckStore((s) => s.generationStep);
  const generationProgress = useDeckStore((s) => s.generationProgress);
  const generationError = useDeckStore((s) => s.generationError);
  const setAppPhase = useUiStore((s) => s.setAppPhase);

  useEffect(() => {
    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-8)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        {generationError ? (
          <>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-error)' }}>
              Generation Failed
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>{generationError}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <Button onClick={() => generate()}>Retry</Button>
              <Button variant="secondary" onClick={() => setAppPhase('style-select')}>Go Back</Button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto var(--space-6)',
              animation: 'spin 1.5s linear infinite',
            }}>
              <Loader size={64} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Building Your Deck
            </h2>
            <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              {generationStep || 'Initializing...'}
            </p>

            {/* Progress bar */}
            <div style={{
              width: '100%', height: '6px', background: 'var(--color-border)',
              borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-6)',
            }}>
              <div style={{
                width: `${generationProgress}%`, height: '100%',
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)',
            }}>
              <Shield size={14} />
              <span>Your data is masked before AI processing</span>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
