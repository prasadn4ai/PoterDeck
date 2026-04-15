import PptxGenJS from 'pptxgenjs';

const COLOR_MAP = {
  blue: { primary: '2563EB', bg: 'F8FAFC', text: '0F172A', muted: '64748B' },
  purple: { primary: '7C3AED', bg: 'FAF5FF', text: '1E1B4B', muted: '6B7280' },
  teal: { primary: '0D9488', bg: 'F0FDFA', text: '134E4A', muted: '6B7280' },
  rose: { primary: 'E11D48', bg: 'FFF1F2', text: '1C1917', muted: '6B7280' },
  amber: { primary: 'D97706', bg: 'FFFBEB', text: '1C1917', muted: '6B7280' },
};

const FONT_MAP = {
  corporate: 'Calibri', modern: 'Calibri', minimal: 'Calibri', glass: 'Calibri', bold: 'Calibri',
};

export function buildPptx(slides, style, colorTheme, deckTitle) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deckTitle || 'PoterDeck Presentation';

  const c = COLOR_MAP[colorTheme] || COLOR_MAP.blue;
  const font = FONT_MAP[style] || 'Calibri';

  for (const slide of slides) {
    const pptxSlide = pptx.addSlide();

    switch (slide.type) {
      case 'title':
        pptxSlide.background = { fill: c.primary };
        pptxSlide.addText(slide.title || 'Untitled', { x: 0.8, y: 1.5, w: '85%', fontSize: 36, fontFace: font, color: 'FFFFFF', bold: true, align: 'center' });
        if (slide.subtitle) pptxSlide.addText(slide.subtitle, { x: 0.8, y: 3.0, w: '85%', fontSize: 18, fontFace: font, color: 'FFFFFF', align: 'center' });
        break;

      case 'agenda':
        pptxSlide.addText(slide.title || 'Agenda', { x: 0.5, y: 0.3, fontSize: 24, fontFace: font, color: c.primary, bold: true });
        (slide.items || []).forEach((item, i) => {
          const text = typeof item === 'string' ? item : item.title || String(item);
          pptxSlide.addText(`${i + 1}. ${text}`, { x: 0.8, y: 1.2 + i * 0.5, fontSize: 14, fontFace: font, color: c.text });
        });
        break;

      case 'dashboard':
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.3, fontSize: 24, fontFace: font, color: c.primary, bold: true });
        (slide.metrics || []).forEach((m, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          pptxSlide.addShape('rect', { x: 0.5 + col * 3.8, y: 1.2 + row * 2.0, w: 3.5, h: 1.7, fill: { color: 'F1F5F9' }, rectRadius: 0.1 });
          pptxSlide.addText(m.label, { x: 0.7 + col * 3.8, y: 1.3 + row * 2.0, fontSize: 10, fontFace: font, color: c.muted, bold: true });
          pptxSlide.addText(m.value, { x: 0.7 + col * 3.8, y: 1.7 + row * 2.0, fontSize: 28, fontFace: font, color: c.text, bold: true });
          if (m.change) pptxSlide.addText(m.change, { x: 0.7 + col * 3.8, y: 2.4 + row * 2.0, fontSize: 10, fontFace: font, color: m.trend === 'up' ? '10B981' : 'EF4444' });
        });
        break;

      case 'table':
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.3, fontSize: 24, fontFace: font, color: c.primary, bold: true });
        if (slide.headers?.length && slide.rows?.length) {
          const tableRows = [slide.headers.map((h) => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: c.primary } } }))];
          slide.rows.forEach((row) => { tableRows.push((Array.isArray(row) ? row : [row]).map((cell) => ({ text: String(cell) }))); });
          pptxSlide.addTable(tableRows, { x: 0.5, y: 1.2, w: 12, fontSize: 11, fontFace: font, border: { pt: 0.5, color: 'E2E8F0' }, autoPage: true });
        }
        break;

      case 'section-overview':
        pptxSlide.background = { fill: c.bg };
        pptxSlide.addShape('rect', { x: 0, y: 0, w: 0.08, h: '100%', fill: { color: c.primary } });
        pptxSlide.addText(slide.title, { x: 0.8, y: 1.5, w: '80%', fontSize: 32, fontFace: font, color: c.primary, bold: true });
        if (slide.subtitle) pptxSlide.addText(slide.subtitle, { x: 0.8, y: 2.5, w: '80%', fontSize: 16, fontFace: font, color: c.muted });
        break;

      case 'highlight-list':
        pptxSlide.addText(slide.title, { x: 0.5, y: 0.3, fontSize: 24, fontFace: font, color: c.primary, bold: true });
        (slide.items || []).forEach((item, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          pptxSlide.addShape('rect', { x: 0.5 + col * 3.8, y: 1.2 + row * 2.2, w: 3.5, h: 2.0, fill: { color: 'F8FAFC' }, rectRadius: 0.1 });
          pptxSlide.addText(item.title || '', { x: 0.7 + col * 3.8, y: 1.5 + row * 2.2, fontSize: 13, fontFace: font, color: c.text, bold: true });
          pptxSlide.addText(item.body || '', { x: 0.7 + col * 3.8, y: 2.0 + row * 2.2, fontSize: 10, fontFace: font, color: c.muted, w: 3.1 });
        });
        break;

      case 'thank-you':
        pptxSlide.background = { fill: c.primary };
        pptxSlide.addText(slide.title || 'Thank You', { x: 0.8, y: 1.8, w: '85%', fontSize: 36, fontFace: font, color: 'FFFFFF', bold: true, align: 'center' });
        if (slide.subtitle) pptxSlide.addText(slide.subtitle, { x: 0.8, y: 3.0, w: '85%', fontSize: 18, fontFace: font, color: 'FFFFFF', align: 'center' });
        break;

      default: // content
        pptxSlide.addText(slide.title || '', { x: 0.5, y: 0.3, fontSize: 24, fontFace: font, color: c.primary, bold: true });
        if (slide.body) pptxSlide.addText(slide.body, { x: 0.5, y: 1.2, w: '90%', fontSize: 13, fontFace: font, color: c.text, lineSpacingMultiple: 1.3 });
        if (slide.bullets?.length) {
          slide.bullets.forEach((b, i) => {
            pptxSlide.addText(`\u2022 ${b}`, { x: 0.7, y: 1.2 + (slide.body ? 1.5 : 0) + i * 0.45, fontSize: 13, fontFace: font, color: c.text });
          });
        }
        if (slide.bigStat) pptxSlide.addText(slide.bigStat, { x: 0.5, y: 1.0, fontSize: 48, fontFace: font, color: c.primary, bold: true });
        break;
    }
  }

  return pptx;
}
