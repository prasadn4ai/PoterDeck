import { create } from 'zustand';

export const useDeckStore = create((set) => ({
  // State
  selectedDeckType: null,
  selectedStyle: null,
  selectedColorTheme: null,
  userIntent: '',
  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  generationError: null,
  sessionId: null,
  generatedModel: null,
  generationTimeMs: null,
  modelQualityTier: null, // 'primary' | 'fallback' | 'degraded' | null

  // Auth state
  token: null,
  user: null,
  userTier: 'free', // 'free' | 'premium'

  // Branding state
  logoData: localStorage.getItem('poterdeck_logo') || null,
  logoPosition: localStorage.getItem('poterdeck_logo_position') || 'bottom-left',
  logoSize: Number(localStorage.getItem('poterdeck_logo_size')) || 48,

  // Actions
  resetDeck: () => set({
    selectedDeckType: null,
    selectedStyle: null,
    selectedColorTheme: null,
    userIntent: '',
    isGenerating: false,
    generationProgress: 0,
    generationStep: '',
    generationError: null,
    sessionId: null,
    generatedModel: null,
    generationTimeMs: null,
    modelQualityTier: null,
  }),
  setDeckType: (type) => set({ selectedDeckType: type }),
  setStyle: (style) => set({ selectedStyle: style }),
  setColorTheme: (theme) => set({ selectedColorTheme: theme }),
  setIntent: (intent) => set({ userIntent: intent }),
  startGeneration: () => set({ isGenerating: true, generationProgress: 0, generationStep: 'Initializing...', generationError: null }),
  setGenerationProgress: (step, progress) => set({ generationStep: step, generationProgress: progress }),
  completeGeneration: (model, timeMs, tier) => set({
    isGenerating: false,
    generationProgress: 100,
    generationStep: 'Complete',
    generatedModel: model,
    generationTimeMs: timeMs,
    modelQualityTier: tier,
  }),
  setGenerationError: (error) => set({ isGenerating: false, generationError: error }),

  // Auth actions
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setUserTier: (tier) => set({ userTier: tier }),
  logout: () => set({ token: null, user: null, userTier: 'free' }),

  // Branding actions
  setLogoData: (data) => set({ logoData: data }),
  setLogoPosition: (pos) => set({ logoPosition: pos }),
  setLogoSize: (size) => set({ logoSize: size }),
}));
