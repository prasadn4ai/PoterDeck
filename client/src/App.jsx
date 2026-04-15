import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Toast } from './components/shared/Toast';
import { LoadingState } from './components/shared/LoadingState';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { LandingPage } from './components/landing/LandingPage';
import { StyleSelectPage } from './components/decks/StyleSelectPage';
import { GeneratingPage } from './components/decks/GeneratingPage';
import { ViewerPage } from './components/viewer/ViewerPage';
import { ExportPage } from './components/export/ExportPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PresentationMode } from './components/presentation/PresentationMode';
import { VoiceButton } from './components/voice/VoiceButton';
import { VoiceToast } from './components/voice/VoiceToast';
import { SettingsPage } from './components/settings/SettingsPage';
import { useUiStore } from './store/uiStore';
import { useDeckStore } from './store/deckStore';
import { useViewerStore } from './store/viewerStore';
import { useSessionRestore } from './hooks/useSessionRestore';
import { useConfidence } from './hooks/useConfidence';
import { useScreenshotProtection } from './hooks/useScreenshotProtection';
import { getMe } from './services/apiService';
import { hasRecoverableSession, loadSession, clearSession } from './services/sessionService';

function PhaseRouter() {
  const appPhase = useUiStore((s) => s.appPhase);
  const authMode = useUiStore((s) => s.authMode);
  const isPresentationMode = useUiStore((s) => s.isPresentationMode);

  if (isPresentationMode) return <PresentationMode />;

  switch (appPhase) {
    case 'auth':
      return authMode === 'register' ? <RegisterPage /> : <LoginPage />;
    case 'landing':
      return <LandingPage />;
    case 'style-select':
      return <StyleSelectPage />;
    case 'generating':
      return <GeneratingPage />;
    case 'viewer':
      return <ViewerPage />;
    case 'export':
      return <ExportPage />;
    case 'admin':
      return <AdminDashboard />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const setDarkMode = useUiStore((s) => s.setDarkMode);
  const setToken = useDeckStore((s) => s.setToken);
  const setUser = useDeckStore((s) => s.setUser);

  // Hooks
  useSessionRestore();
  useConfidence();
  useScreenshotProtection();

  // Restore dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem('poterdeck_darkmode');
    if (stored !== null) {
      setDarkMode(JSON.parse(stored));
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  // Restore auth session (with Electron first-run detection)
  useEffect(() => {
    async function init() {
      // Electron: if not configured, go straight to Settings
      if (window.electronAPI) {
        try {
          const configured = await window.electronAPI.isConfigured();
          if (!configured) {
            setAppPhase('settings');
            setAuthReady(true);
            return;
          }
        } catch {
          // If isConfigured fails, still show settings
          setAppPhase('settings');
          setAuthReady(true);
          return;
        }
      }

      // Check for saved auth token
      const savedToken = localStorage.getItem('poterdeck_token');
      if (!savedToken) {
        setAppPhase('auth');
        setAuthReady(true);
        return;
      }

      // Validate token with server
      setToken(savedToken);
      try {
        const data = await getMe();
        setUser(data.user);

        // Check for recoverable session with actual slides
        const session = loadSession();
        if (session?.slides?.length > 0) {
          useDeckStore.setState({
            selectedDeckType: session.deckType,
            selectedStyle: session.style,
            selectedColorTheme: session.colorTheme,
            userIntent: session.intent,
            sessionId: session.sessionId,
          });
          useViewerStore.setState({
            slides: session.slides,
            approvedSlides: session.approvedSlides || new Set(),
          });
          setAppPhase('viewer');
        } else {
          clearSession();
          setAppPhase('landing');
        }
      } catch {
        // Token invalid or server unreachable
        localStorage.removeItem('poterdeck_token');
        setToken(null);
        setAppPhase('auth');
      }
      setAuthReady(true);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const appPhase = useUiStore((s) => s.appPhase);
  const showVoice = appPhase === 'viewer';

  if (!authReady) {
    return <LoadingState message="Loading PoterDeck..." />;
  }

  return (
    <ErrorBoundary>
      <PhaseRouter />
      {showVoice && <VoiceButton />}
      {showVoice && <VoiceToast />}
      <Toast />
    </ErrorBoundary>
  );
}
