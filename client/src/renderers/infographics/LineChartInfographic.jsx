import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_DATA = [
  { name: 'Jan', value: 30 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 42 },
  { name: 'Apr', value: 58 }, { name: 'May', value: 65 }, { name: 'Jun', value: 72 },
];

export function LineChartInfographic({ data, colors }) {
  const chartData = data?.points
    ? data.points.map((p) => ({ name: p.x, value: p.y }))
    : DEFAULT_DATA;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors?.primary + '20'} />
        <XAxis dataKey="name" fontSize={11} tick={{ fill: colors?.textMuted }} />
        <YAxis fontSize={11} tick={{ fill: colors?.textMuted }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={colors?.primary || '#2563EB'} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
