import React from 'react';
import { BarChartInfographic } from './BarChartInfographic';
import { LineChartInfographic } from './LineChartInfographic';
import { KPIScorecard } from './KPIScorecard';
import { RoadmapTimeline } from './RoadmapTimeline';
import { RiskMatrix } from './RiskMatrix';
import { SalesFunnelInfographic } from './SalesFunnelInfographic';
import { ProcessFlow } from './ProcessFlow';
import { GaugeInfographic } from './GaugeInfographic';

const MAP = {
  'bar-chart': BarChartInfographic,
  'revenue_bar_chart': BarChartInfographic,
  'region_pie_chart': BarChartInfographic,
  'line-chart': LineChartInfographic,
  'trend_line_chart': LineChartInfographic,
  'kpi-scorecard': KPIScorecard,
  'kpi_scorecard': KPIScorecard,
  'roadmap-timeline': RoadmapTimeline,
  'roadmap_timeline': RoadmapTimeline,
  'risk-matrix': RiskMatrix,
  'risk_matrix': RiskMatrix,
  'sales-funnel': SalesFunnelInfographic,
  'sales_funnel': SalesFunnelInfographic,
  'process-flow': ProcessFlow,
  'process_flow': ProcessFlow,
  'gauge': GaugeInfographic,
  'gauge_chart': GaugeInfographic,
};

export function InfographicRenderer({ type, data, colors }) {
  const Component = MAP[type];
  if (!Component) return <div style={{ color: colors?.textMuted, fontSize: '12px' }}>Infographic: {type}</div>;
  return <Component data={data || {}} colors={colors} />;
}
