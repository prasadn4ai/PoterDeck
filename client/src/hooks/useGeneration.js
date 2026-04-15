import { useCallback } from 'react';
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

  const generate = useCallback(async () => {
    const { userIntent, selectedDeckType, selectedStyle, selectedColorTheme } = useDeckStore.getState();
    const deck = getDeckById(selectedDeckType);
    if (!deck) return;

    startGeneration();
    setAppPhase('generating');

    // Simulated progress steps
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
      setSlides(result.slides);
      completeGeneration(result.model, result.generationTimeMs, result.model_tier);
      useDeckStore.setState({ sessionId: result.sessionId });
      setAppPhase('viewer');
    } catch (err) {
      clearInterval(progressInterval);
      const msg = err.response?.data?.error || err.message || 'Generation failed';
      setGenerationError(msg);
    }
  }, [startGeneration, setGenerationProgress, completeGeneration, setGenerationError, setSlides, setAppPhase]);

  return { generate };
}
