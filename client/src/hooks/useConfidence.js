import { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { useUiStore } from '../store/uiStore';
import { scoreSlideConfidence, checkFailureGuardrail } from '../engine/confidenceEngine';

export function useConfidence() {
  const slides = useViewerStore((s) => s.slides);
  const manuallyEditedSlides = useViewerStore((s) => s.manuallyEditedSlides);
  const guardrailBannerShown = useUiStore((s) => s.guardrailBannerShown);
  const markGuardrailBannerShown = useUiStore((s) => s.markGuardrailBannerShown);
  const setToast = useUiStore((s) => s.setToast);

  // Recompute confidence scores when slides change
  useEffect(() => {
    if (slides.length === 0) return;
    const updateSlide = useViewerStore.getState().updateSlide;
    slides.forEach((slide, i) => {
      const newScore = scoreSlideConfidence(slide);
      if (slide.confidenceScore !== newScore) {
        updateSlide(i, { confidenceScore: newScore });
      }
    });
  }, [slides]);

  // Check failure guardrail
  useEffect(() => {
    if (slides.length === 0 || guardrailBannerShown) return;
    const result = checkFailureGuardrail(slides.length, manuallyEditedSlides.size);
    if (result.exceeded) {
      setToast({ type: 'warning', message: result.message });
      markGuardrailBannerShown();
    }
  }, [slides.length, manuallyEditedSlides.size, guardrailBannerShown, markGuardrailBannerShown, setToast]);
}
