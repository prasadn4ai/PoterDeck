import { useEffect } from 'react';
import { useDeckStore } from '../store/deckStore';
import { useUiStore } from '../store/uiStore';

export function useScreenshotProtection() {
  const userTier = useDeckStore((s) => s.userTier);
  const setToast = useUiStore((s) => s.setToast);

  useEffect(() => {
    // Premium users: no protection
    if (userTier === 'premium') return;

    // Electron: OS-level content protection
    if (window.electronAPI) {
      // This is handled in main.js via setContentProtection
    }

    // JS layer: detect screenshot keys
    const handleKeyDown = (e) => {
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setToast({ type: 'warning', message: 'Screenshots disabled. Please use Export to download your deck.' });
      }
      // Ctrl+Shift+S (save page)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setToast({ type: 'warning', message: 'Please use Export to save your deck.' });
      }
      // Ctrl+P (print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setToast({ type: 'warning', message: 'Please use Export > PDF to print your deck.' });
      }
    };

    // Disable right-click on slide area
    const handleContextMenu = (e) => {
      const slideArea = e.target.closest('[data-slide-canvas]');
      if (slideArea) {
        e.preventDefault();
        setToast({ type: 'info', message: 'Right-click disabled on slides. Use Export to download.' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [userTier, setToast]);
}
