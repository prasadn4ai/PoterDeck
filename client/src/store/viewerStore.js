import { create } from 'zustand';

export const useViewerStore = create((set, get) => ({
  // State
  slides: [],
  activeSlideIndex: 0,
  approvedSlides: new Set(),
  previousSlides: null, // undo buffer (1 step)
  confidenceFilter: 'all', // 'all' | 'weak' | 'needs-review'
  manuallyEditedSlides: new Set(),
  maskedCount: 0,
  realDataInjected: false,

  // Actions
  setSlides: (slides) => set({ slides, activeSlideIndex: 0 }),
  setActiveSlide: (index) => set({ activeSlideIndex: index }),
  updateSlide: (index, patch) => set((state) => {
    const slides = [...state.slides];
    slides[index] = { ...slides[index], ...patch };
    return { slides };
  }),
  approveSlide: (index) => set((state) => {
    const next = new Set(state.approvedSlides);
    next.add(index);
    return { approvedSlides: next };
  }),
  trackManualEdit: (index) => set((state) => {
    const next = new Set(state.manuallyEditedSlides);
    next.add(index);
    return { manuallyEditedSlides: next };
  }),
  savePreviousSlides: () => set((state) => ({
    previousSlides: JSON.parse(JSON.stringify(state.slides)),
  })),
  undoRegeneration: () => set((state) => {
    if (!state.previousSlides) return {};
    return { slides: state.previousSlides, previousSlides: null };
  }),
  replaceWeakSlides: (improved) => set((state) => {
    const slides = [...state.slides];
    for (const slide of improved) {
      const idx = slides.findIndex((s) => s.id === slide.id);
      if (idx !== -1) slides[idx] = slide;
    }
    return { slides };
  }),
  setConfidenceFilter: (filter) => set({ confidenceFilter: filter }),
  setMaskedCount: (count) => set({ maskedCount: count }),
  setRealDataInjected: (value) => set({ realDataInjected: value }),
}));
