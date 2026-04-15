// Local dev server — proxies API routes to simulate Vercel Serverless Functions
// Usage: node dev-server.js (runs on port 3000)

import express from 'express';
import { config } from 'dotenv';
config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-BYOK-Gemini, X-BYOK-OpenAI, X-BYOK-Anthropic');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Dynamic route loader — maps /api/path to api/path.js
async function loadHandler(routePath) {
  try {
    const mod = await import(`./api/${routePath}.js`);
    return mod.default;
  } catch (err) {
    console.error(`Failed to load handler: api/${routePath}.js`, err.message);
    return null;
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => { const h = await loadHandler('auth/register'); h?.(req, res); });
app.post('/api/auth/login', async (req, res) => { const h = await loadHandler('auth/login'); h?.(req, res); });
app.post('/api/auth/logout', async (req, res) => { const h = await loadHandler('auth/logout'); h?.(req, res); });
app.get('/api/auth/me', async (req, res) => { const h = await loadHandler('auth/me'); h?.(req, res); });

// AI routes
app.post('/api/ai/generate', async (req, res) => { const h = await loadHandler('ai/generate'); h?.(req, res); });
app.post('/api/ai/regenerate-deck', async (req, res) => { const h = await loadHandler('ai/regenerate-deck'); h?.(req, res); });
app.post('/api/ai/edit-slide', async (req, res) => { const h = await loadHandler('ai/edit-slide'); h?.(req, res); });
app.post('/api/ai/voice-command', async (req, res) => { const h = await loadHandler('ai/voice-command'); h?.(req, res); });
app.post('/api/ai/bulk-improve', async (req, res) => { const h = await loadHandler('ai/bulk-improve'); h?.(req, res); });

// Privacy routes
app.get('/api/privacy/mask-count', async (req, res) => { const h = await loadHandler('privacy/mask-count'); h?.(req, res); });
app.post('/api/privacy/inject-real-data', async (req, res) => { const h = await loadHandler('privacy/inject-real-data'); h?.(req, res); });

// Export routes
app.post('/api/export/pptx', async (req, res) => { const h = await loadHandler('export/pptx'); h?.(req, res); });
app.post('/api/export/json', async (req, res) => { const h = await loadHandler('export/json'); h?.(req, res); });

// Upload
app.post('/api/upload/file', async (req, res) => { const h = await loadHandler('upload/file'); h?.(req, res); });

// Admin routes
app.get('/api/admin/users', async (req, res) => { const h = await loadHandler('admin/users'); h?.(req, res); });
app.patch('/api/admin/users', async (req, res) => { const h = await loadHandler('admin/users'); h?.(req, res); });
app.delete('/api/admin/users', async (req, res) => { const h = await loadHandler('admin/users'); h?.(req, res); });
app.get('/api/admin/llm-keys', async (req, res) => { const h = await loadHandler('admin/llm-keys'); h?.(req, res); });
app.put('/api/admin/llm-keys/:provider', async (req, res) => { const h = await loadHandler('admin/llm-keys'); h?.(req, res); });
app.get('/api/admin/analytics', async (req, res) => { const h = await loadHandler('admin/analytics'); h?.(req, res); });

// Health
app.get('/api/health', async (req, res) => { const h = await loadHandler('health'); h?.(req, res); });

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`[API] Running on http://localhost:${PORT}`);
  console.log(`[API] Supabase: ${process.env.SUPABASE_URL ? 'OK' : 'MISSING'}`);
  console.log(`[API] Gemini: ${process.env.GOOGLE_API_KEY ? 'OK' : 'MISSING'}`);
});

server.keepAliveTimeout = 120000;
process.on('uncaughtException', (err) => { console.error('[API] Uncaught:', err.message); });
process.on('unhandledRejection', (err) => { console.error('[API] Unhandled:', err?.message || err); });
