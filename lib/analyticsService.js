import { supabase } from './supabase.js';

export async function recordEvent({ eventType, userId, provider, keyType, exportFormat, slideCount, latencyMs }) {
  // NEVER log prompt content, key values, or slide data
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    user_id: userId,
    provider: provider || null,
    key_type: keyType || null,
    export_format: exportFormat || null,
    slide_count: slideCount || null,
    latency_ms: latencyMs || null,
  }).catch((err) => console.error('Analytics insert error:', err.message));
}

export async function getAnalytics({ from, to }) {
  const query = supabase.from('analytics_events').select('*');
  if (from) query.gte('created_at', from);
  if (to) query.lte('created_at', to);

  const { data: events } = await query;
  if (!events) return { decksPerUser: {}, llmCallsPerDay: {}, exportsByFormat: {}, activeUsersPerDay: {}, llmCallsByProvider: {} };

  const decksPerUser = {};
  const llmCallsPerDay = {};
  const exportsByFormat = {};
  const activeUsersPerDay = {};
  const llmCallsByProvider = {};

  for (const e of events) {
    const day = e.created_at?.slice(0, 10);

    if (e.event_type === 'deck_created') {
      decksPerUser[e.user_id] = (decksPerUser[e.user_id] || 0) + 1;
    }
    if (e.event_type === 'llm_call' || e.event_type === 'deck_created') {
      llmCallsPerDay[day] = (llmCallsPerDay[day] || 0) + 1;
      if (e.provider) llmCallsByProvider[e.provider] = (llmCallsByProvider[e.provider] || 0) + 1;
    }
    if (e.event_type === 'export') {
      exportsByFormat[e.export_format] = (exportsByFormat[e.export_format] || 0) + 1;
    }
    if (e.user_id && day) {
      if (!activeUsersPerDay[day]) activeUsersPerDay[day] = new Set();
      activeUsersPerDay[day].add(e.user_id);
    }
  }

  // Convert Sets to counts
  for (const day of Object.keys(activeUsersPerDay)) {
    activeUsersPerDay[day] = activeUsersPerDay[day].size;
  }

  return { decksPerUser, llmCallsPerDay, exportsByFormat, activeUsersPerDay, llmCallsByProvider };
}
