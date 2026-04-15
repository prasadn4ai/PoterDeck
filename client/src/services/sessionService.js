const STORAGE_KEY = 'poterdeck_session';
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveSession({ appPhase, deckType, style, colorTheme, intent, slides, approvedSlides, sessionId, darkMode }) {
  const payload = {
    appPhase, deckType, style, colorTheme, intent,
    slides,
    approvedSlides: approvedSlides instanceof Set ? [...approvedSlides] : approvedSlides || [],
    sessionId, darkMode,
    savedAt: new Date().toISOString(),
    // EXCLUDED: maskMap, BYOK keys
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const age = Date.now() - new Date(session.savedAt).getTime();
    if (age > MAX_AGE_MS) { clearSession(); return null; }
    session.approvedSlides = new Set(session.approvedSlides || []);
    return session;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasRecoverableSession() {
  return !!loadSession();
}
