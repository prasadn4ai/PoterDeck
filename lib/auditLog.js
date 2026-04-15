// Metadata-only logging — NEVER logs prompt content, key values, or slide data
export function logEvent({ eventType, userId, provider, latencyMs, status, correlationId }) {
  const entry = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: userId || 'anonymous',
    provider: provider || null,
    latencyMs: latencyMs || null,
    status: status || 'success',
    correlationId: correlationId || null,
  };
  console.log('[AUDIT]', JSON.stringify(entry));
}
