import { useCallback, useRef } from 'react';
import { useDeckStore } from '../store/deckStore';
import { useViewerStore } from '../store/viewerStore';
import { useUiStore } from '../store/uiStore';
import { generateDeck } from '../services/apiService';
import { getDeckById } from '../engine/deckRegistry';

export function useGeneration() {
  const startGeneration = useDeckStore((s) => s.startGeneration);
  const setGenerationProgress = useDeckStore((s) => s.setGenerationProgress);
  const completeGeneration = useDeckStore((s) => s.completeGeneration);
  const setGenerationError = useDeckStore((s) => s.setGenerationError);
  const setSlides = useViewerStore((s) => s.setSlides);
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const generatingRef = useRef(false);

  const generate = useCallback(async () => {
    // Prevent double-fire from React StrictMode
    if (generatingRef.current) {
      console.log('[GEN] Already generating, skipping duplicate');
      return;
    }
    generatingRef.current = true;

    const { userIntent, selectedDeckType, selectedStyle, selectedColorTheme } = useDeckStore.getState();
    const deck = getDeckById(selectedDeckType);
    if (!deck) { generatingRef.current = false; return; }

    console.log('[GEN] Starting generation:', selectedDeckType, selectedStyle, selectedColorTheme);
    startGeneration();

    const steps = [
      { msg: 'Structuring outline...', pct: 15 },
      { msg: 'Generating slides...', pct: 45 },
      { msg: 'Applying design...', pct: 75 },
      { msg: 'Finalizing...', pct: 90 },
    ];

    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setGenerationProgress(steps[stepIdx].msg, steps[stepIdx].pct);
        stepIdx++;
      }
    }, 2500);

    try {
      const result = await generateDeck({
        intent: userIntent,
        deckType: selectedDeckType,
        style: selectedStyle,
        colorTheme: selectedColorTheme,
        slideSequence: deck.slideSequence,
      });

      clearInterval(progressInterval);
      console.log('[GEN] Success:', result.slides?.length, 'slides from', result.model);

      if (result.slides && result.slides.length > 0) {
        setSlides(result.slides);
        completeGeneration(result.model, result.generationTimeMs, result.model_tier);
        useDeckStore.setState({ sessionId: result.sessionId });
        setAppPhase('viewer');
      } else {
        setGenerationError('No slides returned from AI. Please retry.');
      }
    } catch (err) {
      clearInterval(progressInterval);
      const msg = err.response?.data?.error || err.message || 'Generation failed';
      console.error('[GEN] Error:', msg);
      setGenerationError(msg);
    } finally {
      generatingRef.current = false;
    }
  }, [startGeneration, setGenerationProgress, completeGeneration, setGenerationError, setSlides, setAppPhase]);

  return { generate };
}
