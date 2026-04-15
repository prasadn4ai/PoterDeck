import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_DATA = [
  { name: 'Q1', value: 4200 }, { name: 'Q2', value: 5800 },
  { name: 'Q3', value: 4900 }, { name: 'Q4', value: 7100 },
];

export function BarChartInfographic({ data, colors }) {
  const chartData = data?.labels
    ? data.labels.map((l, i) => ({ name: l, value: data.values?.[i] || 0 }))
    : DEFAULT_DATA;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors?.primary + '20'} />
        <XAxis dataKey="name" fontSize={11} tick={{ fill: colors?.textMuted }} />
        <YAxis fontSize={11} tick={{ fill: colors?.textMuted }} />
        <Tooltip />
        <Bar dataKey="value" fill={colors?.primary || '#2563EB'} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
