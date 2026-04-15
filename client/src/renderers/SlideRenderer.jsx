import React from 'react';
import { getTypography, getSpacing, getColorTheme, selectLayout } from '../engine/designEngine';
import { TitleRenderer } from './TitleRenderer';
import { AgendaRenderer } from './AgendaRenderer';
import { ContentRenderer } from './ContentRenderer';
import { DashboardRenderer } from './DashboardRenderer';
import { TableRenderer } from './TableRenderer';
import { SectionOverviewRenderer } from './SectionOverviewRenderer';
import { HighlightListRenderer } from './HighlightListRenderer';
import { ThankYouRenderer } from './ThankYouRenderer';

const RENDERER_MAP = {
  title: TitleRenderer,
  agenda: AgendaRenderer,
  content: ContentRenderer,
  dashboard: DashboardRenderer,
  table: TableRenderer,
  'section-overview': SectionOverviewRenderer,
  'highlight-list': HighlightListRenderer,
  'thank-you': ThankYouRenderer,
};

export function SlideRenderer({ slide, style = 'corporate', colorTheme = 'blue' }) {
  const Renderer = RENDERER_MAP[slide?.type] || ContentRenderer;
  const typo = getTypography(style);
  const spacing = getSpacing(style);
  const colors = getColorTheme(colorTheme);
  const layout = selectLayout(slide, style);

  return (
    <div style={{
      width: '960px', height: '540px', position: 'relative', overflow: 'hidden',
      background: colors.bg, fontFamily: typo.titleFont + ', sans-serif',
      color: colors.text,
    }}>
      <Renderer slide={slide} typo={typo} spacing={spacing} colors={colors} layout={layout} />
    </div>
  );
}
