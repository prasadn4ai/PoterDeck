import React from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { SlideRenderer } from '../../renderers/SlideRenderer';
import { useDeckStore } from '../../store/deckStore';

export function SlideNavigator() {
  const slides = useViewerStore((s) => s.slides);
  const activeSlideIndex = useViewerStore((s) => s.activeSlideIndex);
  const setActiveSlide = useViewerStore((s) => s.setActiveSlide);
  const approvedSlides = useViewerStore((s) => s.approvedSlides);
  const style = useDeckStore((s) => s.selectedStyle);
  const colorTheme = useDeckStore((s) => s.selectedColorTheme);

  return (
    <div style={{
      width: '200px', height: '100%', overflowY: 'auto',
      background: 'var(--color-bg-alt)', borderRight: '1px solid var(--color-border)',
      padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
    }}>
      {slides.map((slide, i) => (
        <button
          key={slide.id || i}
          onClick={() => setActiveSlide(i)}
          style={{
            border: activeSlideIndex === i ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer',
            background: 'var(--color-surface)', padding: 0, position: 'relative',
            aspectRatio: '16/9',
          }}
        >
          <div style={{ transform: 'scale(0.18)', transformOrigin: 'top left', width: '960px', height: '540px', pointerEvents: 'none' }}>
            <SlideRenderer slide={slide} style={style} colorTheme={colorTheme} />
          </div>
          {/* Slide number */}
          <div style={{
            position: 'absolute', bottom: '2px', left: '4px',
            fontSize: '9px', fontWeight: 600, color: 'var(--color-text-muted)',
          }}>
            {i + 1}
          </div>
          {/* Approval checkmark */}
          {approvedSlides.has(i) && (
            <div style={{
              position: 'absolute', top: '2px', right: '4px',
              width: '14px', height: '14px', borderRadius: '50%',
              background: 'var(--color-success)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px',
            }}>
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
