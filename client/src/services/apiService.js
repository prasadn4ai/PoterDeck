import axios from 'axios';

// In Electron, API runs on a dynamic port; in browser, use Vite proxy
async function getBaseURL() {
  if (window.electronAPI) {
    const port = await window.electronAPI.getApiPort();
    return `http://localhost:${port}/api`;
  }
  return '/api';
}

let baseURLPromise = null;
function ensureBaseURL() {
  if (!baseURLPromise) baseURLPromise = getBaseURL();
  return baseURLPromise;
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Dynamically set baseURL for Electron
api.interceptors.request.use(async (config) => {
  const base = await ensureBaseURL();
  config.baseURL = base;
  return config;
}, undefined);

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('poterdeck_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach BYOK keys from localStorage (headers only, never body/URL)
  const byokGemini = localStorage.getItem('poterdeck_byok_gemini');
  const byokOpenai = localStorage.getItem('poterdeck_byok_openai');
  const byokAnthropic = localStorage.getItem('poterdeck_byok_anthropic');
  if (byokGemini) config.headers['X-BYOK-Gemini'] = byokGemini;
  if (byokOpenai) config.headers['X-BYOK-OpenAI'] = byokOpenai;
  if (byokAnthropic) config.headers['X-BYOK-Anthropic'] = byokAnthropic;

  return config;
});

function normalizeError(err) {
  if (err.response?.data) {
    return {
      message: err.response.data.error || 'An error occurred',
      code: err.response.data.code || 'UNKNOWN',
      status: err.response.status,
      retryable: err.response.status >= 500,
    };
  }
  return {
    message: 'Network error — please check your connection',
    code: 'NETWORK_ERROR',
    status: 0,
    retryable: true,
  };
}

// Auth
export async function register(email, password) {
  const { data } = await api.post('/auth/register', { email, password });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

// Generation
export async function generateDeck({ intent, deckType, style, colorTheme, sessionId }) {
  const { data } = await api.post('/ai/generate', { intent, deckType, style, colorTheme, sessionId });
  return data;
}

// Privacy
export async function getMaskCount(sessionId) {
  const { data } = await api.get(`/privacy/mask-count?sessionId=${sessionId}`);
  return data;
}

export async function injectRealData(sessionId, slides) {
  const { data } = await api.post('/privacy/inject-real-data', { sessionId, slides });
  return data;
}

// Export
export async function exportPptx(slides, style, colorTheme, deckTitle) {
  const response = await api.post('/export/pptx', { slides, style, colorTheme, deckTitle }, {
    responseType: 'blob',
  });
  return response.data;
}

export async function exportJson(deck) {
  const { data } = await api.post('/export/json', { deck });
  return data;
}

// Upload
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Health
export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}

export { normalizeError };
export default api;
