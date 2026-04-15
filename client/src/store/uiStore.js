import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // State
  appPhase: 'landing', // 'landing' | 'auth' | 'deck-select' | 'style-select' | 'generating' | 'viewer' | 'export' | 'admin'
  authMode: 'login', // 'login' | 'register'
  isReviewPanelOpen: false,
  isAdvancedEditOpen: false,
  isPresentationMode: false,
  isVoiceActive: false,
  lastVoiceCommand: null,
  darkMode: false,
  apiMode: 'system', // 'system' | 'byok'
  guardrailBannerShown: false,
  error: null,
  toast: null,

  // Actions
  setAppPhase: (phase) => set({ appPhase: phase }),
  setAuthMode: (mode) => set({ authMode: mode }),
  toggleReviewPanel: () => set((s) => ({ isReviewPanelOpen: !s.isReviewPanelOpen })),
  toggleAdvancedEdit: () => set((s) => ({ isAdvancedEditOpen: !s.isAdvancedEditOpen })),
  setPresentationMode: (active) => set({ isPresentationMode: active }),
  setVoiceActive: (active) => set({ isVoiceActive: active }),
  setLastVoiceCommand: (cmd) => set({ lastVoiceCommand: cmd }),
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('poterdeck_darkmode', JSON.stringify(next));
    return { darkMode: next };
  }),
  setDarkMode: (val) => set(() => {
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
    return { darkMode: val };
  }),
  setApiMode: (mode) => set({ apiMode: mode }),
  markGuardrailBannerShown: () => set({ guardrailBannerShown: true }),
  setError: (error) => set({ error }),
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
