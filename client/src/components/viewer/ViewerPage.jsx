import React, { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useViewerStore } from '../../store/viewerStore';
import { useDeckStore } from '../../store/deckStore';
import { useUiStore } from '../../store/uiStore';
import { SlideNavigator } from '../navigator/SlideNavigator';
import { SlideRenderer } from '../../renderers/SlideRenderer';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

export function ViewerPage() {
  const slides = useViewerStore((s) => s.slides);
  const activeSlideIndex = useViewerStore((s) => s.activeSlideIndex);
  const setActiveSlide = useViewerStore((s) => s.setActiveSlide);
  const selectedStyle = useDeckStore((s) => s.selectedStyle);
  const selectedColorTheme = useDeckStore((s) => s.selectedColorTheme);
  const generatedModel = useDeckStore((s) => s.generatedModel);
  const modelQualityTier = useDeckStore((s) => s.modelQualityTier);
  const generationTimeMs = useDeckStore((s) => s.generationTimeMs);
  const setAppPhase = useUiStore((s) => s.setAppPhase);

  const activeSlide = slides[activeSlideIndex];

  const goNext = useCallback(() => {
    if (activeSlideIndex < slides.length - 1) setActiveSlide(activeSlideIndex + 1);
  }, [activeSlideIndex, slides.length, setActiveSlide]);

  const goPrev = useCallback(() => {
    if (activeSlideIndex > 0) setActiveSlide(activeSlideIndex - 1);
  }, [activeSlideIndex, setActiveSlide]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!slides.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>No slides generated yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)' }}>
      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)', height: '48px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button onClick={() => setAppPhase('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <Home size={18} />
          </button>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
          {activeSlide?.label && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              — {activeSlide.label}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {modelQualityTier && modelQualityTier !== 'primary' && (
            <Badge color="warning">{generatedModel} (fallback)</Badge>
          )}
          {generationTimeMs && (
            <Badge color="default">Generated in {(generationTimeMs / 1000).toFixed(1)}s</Badge>
          )}
          <Button size="sm" onClick={() => setAppPhase('export')}>Export</Button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Slide navigator */}
        <SlideNavigator />

        {/* Slide canvas */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-6)', overflow: 'hidden', background: 'var(--color-bg-alt)',
        }}>
          <div style={{
            transform: 'scale(var(--slide-scale, 0.85))',
            transformOrigin: 'center center',
            boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {activeSlide && (
              <SlideRenderer slide={activeSlide} style={selectedStyle} colorTheme={selectedColorTheme} />
            )}
          </div>

          {/* Nav arrows */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <button onClick={goPrev} disabled={activeSlideIndex === 0}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px', cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={goNext} disabled={activeSlideIndex === slides.length - 1}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px', cursor: activeSlideIndex === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === slides.length - 1 ? 0.3 : 1 }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
