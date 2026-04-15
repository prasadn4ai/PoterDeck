export const LAYOUT_VARIANTS = {
  title: [
    { id: 'title_hero', suitableFor: ['corporate','modern','bold'], structure: 'full_bg_centered' },
    { id: 'title_split', suitableFor: ['minimal','glass'], structure: 'split_left_text' },
  ],
  agenda: [
    { id: 'agenda_numbered', suitableFor: ['corporate','modern','bold'], structure: 'icon_numbered_list' },
    { id: 'agenda_cards', suitableFor: ['glass','modern'], structure: 'card_grid_2col' },
  ],
  content: [
    { id: 'content_visual_left', suitableFor: ['all'], structure: 'visual_left_text_right', trigger: (s) => !!s.infographic },
    { id: 'content_big_stat', suitableFor: ['bold','modern'], structure: 'big_stat_support', trigger: (s) => !!s.bigStat },
    { id: 'content_header_bullets', suitableFor: ['corporate','minimal'], structure: 'header_bullets', trigger: (s) => !s.infographic },
  ],
  dashboard: [
    { id: 'dashboard_kpi_grid', suitableFor: ['all'], structure: 'kpi_card_grid' },
    { id: 'dashboard_hero_metric', suitableFor: ['bold','modern'], structure: 'hero_metric_row' },
  ],
  table: [
    { id: 'table_striped', suitableFor: ['corporate','modern','bold'], structure: 'striped_table' },
    { id: 'table_borderless', suitableFor: ['minimal','glass'], structure: 'borderless_dividers' },
  ],
  'section-overview': [
    { id: 'section_full_accent', suitableFor: ['corporate','modern','bold'], structure: 'full_accent_number' },
    { id: 'section_minimal_bar', suitableFor: ['minimal','glass'], structure: 'minimal_accent_bar' },
  ],
  'highlight-list': [
    { id: 'highlights_icon_row', suitableFor: ['all'], structure: 'icon_card_row' },
    { id: 'highlights_timeline', suitableFor: ['corporate','minimal'], structure: 'vertical_timeline' },
  ],
  'thank-you': [
    { id: 'thankyou_full_color', suitableFor: ['corporate','bold','modern'], structure: 'full_color_centered' },
    { id: 'thankyou_minimal', suitableFor: ['minimal','glass'], structure: 'minimal_white_accent' },
  ],
};

export const TYPOGRAPHY = {
  corporate: { titleSize: '42px', titleWeight: '700', titleFont: 'DM Sans', headingSize: '28px', headingWeight: '600', bodySize: '16px', bodyWeight: '400', labelSize: '12px', labelUppercase: true, metricSize: '48px', metricWeight: '700' },
  modern:    { titleSize: '44px', titleWeight: '700', titleFont: 'Outfit', headingSize: '26px', headingWeight: '600', bodySize: '15px', bodyWeight: '400', labelSize: '11px', labelUppercase: true, metricSize: '52px', metricWeight: '700' },
  minimal:   { titleSize: '48px', titleWeight: '300', titleFont: 'Montserrat', headingSize: '24px', headingWeight: '400', bodySize: '15px', bodyWeight: '300', labelSize: '11px', labelUppercase: false, metricSize: '56px', metricWeight: '300' },
  glass:     { titleSize: '42px', titleWeight: '600', titleFont: 'Outfit', headingSize: '26px', headingWeight: '500', bodySize: '15px', bodyWeight: '400', labelSize: '11px', labelUppercase: false, metricSize: '50px', metricWeight: '600' },
  bold:      { titleSize: '52px', titleWeight: '800', titleFont: 'Outfit', headingSize: '30px', headingWeight: '700', bodySize: '16px', bodyWeight: '400', labelSize: '12px', labelUppercase: true, metricSize: '64px', metricWeight: '800' },
};

export const SPACING = {
  corporate: { outerPad: '48px', innerPad: '32px', gap: '24px', headerH: '64px' },
  modern:    { outerPad: '48px', innerPad: '28px', gap: '20px', headerH: '60px' },
  minimal:   { outerPad: '64px', innerPad: '40px', gap: '32px', headerH: '48px' },
  glass:     { outerPad: '40px', innerPad: '28px', gap: '20px', headerH: '56px' },
  bold:      { outerPad: '40px', innerPad: '24px', gap: '16px', headerH: '72px' },
};

export const COLOR_THEMES = {
  blue:   { primary: '#2563EB', primaryLight: '#3B82F6', primaryDark: '#1D4ED8', accent: '#F59E0B', bg: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textMuted: '#64748B' },
  purple: { primary: '#7C3AED', primaryLight: '#8B5CF6', primaryDark: '#6D28D9', accent: '#F59E0B', bg: '#FAF5FF', surface: '#FFFFFF', text: '#1E1B4B', textMuted: '#6B7280' },
  teal:   { primary: '#0D9488', primaryLight: '#14B8A6', primaryDark: '#0F766E', accent: '#F59E0B', bg: '#F0FDFA', surface: '#FFFFFF', text: '#134E4A', textMuted: '#6B7280' },
  rose:   { primary: '#E11D48', primaryLight: '#F43F5E', primaryDark: '#BE123C', accent: '#2563EB', bg: '#FFF1F2', surface: '#FFFFFF', text: '#1C1917', textMuted: '#6B7280' },
  amber:  { primary: '#D97706', primaryLight: '#F59E0B', primaryDark: '#B45309', accent: '#2563EB', bg: '#FFFBEB', surface: '#FFFFFF', text: '#1C1917', textMuted: '#6B7280' },
};

export function selectLayout(slide, style) {
  const variants = LAYOUT_VARIANTS[slide.type];
  if (!variants?.length) return null;
  const suitable = variants.filter((v) => v.suitableFor.includes('all') || v.suitableFor.includes(style));
  for (const v of suitable) { if (v.trigger && v.trigger(slide)) return v.id; }
  return suitable[0]?.id || variants[0].id;
}

export const getTypography = (style) => TYPOGRAPHY[style] || TYPOGRAPHY.corporate;
export const getSpacing = (style) => SPACING[style] || SPACING.corporate;
export const getColorTheme = (theme) => COLOR_THEMES[theme] || COLOR_THEMES.blue;
