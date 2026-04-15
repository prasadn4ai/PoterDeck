import { useEffect, useRef } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { useDeckStore } from '../store/deckStore';
import { useUiStore } from '../store/uiStore';
import { saveSession } from '../services/sessionService';

export function useSessionRestore() {
  const intervalRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const save = () => {
      const { slides, approvedSlides } = useViewerStore.getState();
      const { selectedDeckType, selectedStyle, selectedColorTheme, userIntent, sessionId } = useDeckStore.getState();
      const { appPhase, darkMode } = useUiStore.getState();
      if (slides.length > 0) {
        saveSession({ appPhase, deckType: selectedDeckType, style: selectedStyle, colorTheme: selectedColorTheme, intent: userIntent, slides, approvedSlides, sessionId, darkMode });
      }
    };

    // 30-second interval
    intervalRef.current = setInterval(save, 30000);

    // Subscribe to meaningful changes (debounced 5s)
    const unsub = useViewerStore.subscribe((state, prev) => {
      if (state.slides !== prev.slides || state.approvedSlides !== prev.approvedSlides) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(save, 5000);
      }
    });

    // beforeunload — save session but don't block close
    const handleUnload = () => {
      const { slides } = useViewerStore.getState();
      if (slides.length > 0) save();
      // Don't call e.preventDefault() — it blocks Electron window close
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(intervalRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      unsub();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
}
