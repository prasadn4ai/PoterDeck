import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/apiService';

const COLORS = ['#2563EB', '#7C3AED', '#0D9488', '#E11D48', '#D97706'];

export function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setData(data)).catch(() => {});
  }, []);

  if (!data) return <div style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</div>;

  const llmDayData = Object.entries(data.llmCallsPerDay || {}).map(([day, count]) => ({ day: day.slice(5), count }));
  const exportData = Object.entries(data.exportsByFormat || {}).map(([format, count]) => ({ name: format, value: count }));
  const providerData = Object.entries(data.llmCallsByProvider || {}).map(([provider, count]) => ({ provider, count }));

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Usage Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* LLM Calls per Day */}
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>LLM Calls / Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={llmDayData}>
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exports by Format */}
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Exports by Format</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={exportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {exportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LLM Calls by Provider */}
        <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>LLM Calls by Provider</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={providerData}>
              <XAxis dataKey="provider" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
