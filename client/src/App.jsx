import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Toast } from './components/shared/Toast';
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
import { useUiStore } from './store/uiStore';
import { useDeckStore } from './store/deckStore';
import { useSessionRestore } from './hooks/useSessionRestore';
import { useConfidence } from './hooks/useConfidence';
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
    default:
      return <LandingPage />;
  }
}

export default function App() {
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const setDarkMode = useUiStore((s) => s.setDarkMode);
  const appPhase = useUiStore((s) => s.appPhase);
  const setToken = useDeckStore((s) => s.setToken);
  const setUser = useDeckStore((s) => s.setUser);

  // Hooks
  useSessionRestore();
  useConfidence();

  // Restore dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem('poterdeck_darkmode');
    if (stored !== null) {
      setDarkMode(JSON.parse(stored));
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  // Restore auth session + check for recoverable deck session
  useEffect(() => {
    const savedToken = localStorage.getItem('poterdeck_token');
    if (savedToken) {
      setToken(savedToken);
      getMe()
        .then((data) => {
          setUser(data.user);

          // Check for recoverable session
          if (hasRecoverableSession()) {
            const confirmed = window.confirm('Resume your previous deck?');
            if (confirmed) {
              const session = loadSession();
              if (session) {
                useDeckStore.setState({
                  selectedDeckType: session.deckType,
                  selectedStyle: session.style,
                  selectedColorTheme: session.colorTheme,
                  userIntent: session.intent,
                  sessionId: session.sessionId,
                });
                const { useViewerStore } = require('./store/viewerStore');
                useViewerStore.setState({
                  slides: session.slides || [],
                  approvedSlides: session.approvedSlides || new Set(),
                });
                setAppPhase('viewer');
                return;
              }
            } else {
              clearSession();
            }
          }

          setAppPhase('landing');
        })
        .catch(() => {
          localStorage.removeItem('poterdeck_token');
          setToken(null);
          setAppPhase('auth');
        });
    } else {
      setAppPhase('auth');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showVoice = appPhase === 'viewer';

  return (
    <ErrorBoundary>
      <PhaseRouter />
      {showVoice && <VoiceButton />}
      {showVoice && <VoiceToast />}
      <Toast />
    </ErrorBoundary>
  );
}
