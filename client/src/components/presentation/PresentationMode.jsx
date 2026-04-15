import React, { useEffect, useCallback } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { useDeckStore } from '../../store/deckStore';
import { useUiStore } from '../../store/uiStore';
import { SlideRenderer } from '../../renderers/SlideRenderer';

export function PresentationMode() {
  const slides = useViewerStore((s) => s.slides);
  const activeSlideIndex = useViewerStore((s) => s.activeSlideIndex);
  const setActiveSlide = useViewerStore((s) => s.setActiveSlide);
  const style = useDeckStore((s) => s.selectedStyle);
  const colorTheme = useDeckStore((s) => s.selectedColorTheme);
  const setPresentationMode = useUiStore((s) => s.setPresentationMode);

  const exitPresentation = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPresentationMode(false);
  }, [setPresentationMode]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setActiveSlide(Math.min(activeSlideIndex + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlide(Math.max(activeSlideIndex - 1, 0));
      } else if (e.key === 'Escape') {
        exitPresentation();
      }
    };

    const handleFsChange = () => {
      if (!document.fullscreenElement) setPresentationMode(false);
    };

    window.addEventListener('keydown', handleKey);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [activeSlideIndex, slides.length, setActiveSlide, exitPresentation, setPresentationMode]);

  const activeSlide = slides[activeSlideIndex];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ transform: 'scale(var(--pres-scale, 1.5))', transformOrigin: 'center center' }}>
        {activeSlide && <SlideRenderer slide={activeSlide} style={style} colorTheme={colorTheme} />}
      </div>
      <div style={{
        position: 'absolute', bottom: '16px', right: '24px',
        color: 'rgba(255,255,255,0.5)', fontSize: '14px',
      }}>
        {activeSlideIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
