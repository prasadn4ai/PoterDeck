import { app, BrowserWindow, ipcMain, shell, Menu, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import net from 'net';
import express from 'express';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

// Force high DPI support
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

// Load backend config
function loadBackendConfig() {
  const paths = [
    path.join(__dirname, '..', 'backend.config.json'),
    path.join(__dirname, 'backend.config.json'),
  ];
  // Add resourcesPath only if available
  if (process.resourcesPath) {
    paths.unshift(path.join(process.resourcesPath, 'backend.config.json'));
  }
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        console.log('[CONFIG] Found:', p);
        return JSON.parse(readFileSync(p, 'utf-8'));
      } catch (e) { console.error('[CONFIG] Error:', e.message); }
    }
  }
  console.warn('[CONFIG] No backend.config.json found');
  return { supabaseUrl: '', supabaseKey: '', jwtSecret: '' };
}

const store = new Store({
  name: 'poterdeck-config',
  defaults: {
    googleApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    windowBounds: { width: 1280, height: 800 },
    firstRun: true,
  },
});

let mainWindow = null;
let splashWindow = null;
let apiPort = 0;
let BACKEND_CONFIG = { supabaseUrl: '', supabaseKey: '', jwtSecret: '' };

// Find available port
function findPort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => findPort(startPort + 1).then(resolve));
  });
}

// Start Express API server IN-PROCESS (no child process needed)
async function startApiServer() {
  apiPort = await findPort(3000);

  // Set env vars for the API modules
  process.env.SUPABASE_URL = BACKEND_CONFIG.supabaseUrl;
  process.env.SUPABASE_SERVICE_KEY = BACKEND_CONFIG.supabaseKey;
  process.env.JWT_SECRET = BACKEND_CONFIG.jwtSecret;
  process.env.GOOGLE_API_KEY = store.get('googleApiKey') || '';
  process.env.OPENAI_API_KEY = store.get('openaiApiKey') || '';
  process.env.ANTHROPIC_API_KEY = store.get('anthropicApiKey') || '';
  process.env.NODE_ENV = 'production';

  const apiApp = express();
  apiApp.use(express.json({ limit: '20mb' }));

  // CORS
  apiApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-BYOK-Gemini, X-BYOK-OpenAI, X-BYOK-Anthropic');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Resolve API handlers — files are INSIDE the asar (same node_modules)
  const apiBase = path.join(__dirname, '..', 'api');

  async function handle(routePath, req, res) {
    try {
      const fullPath = path.join(apiBase, routePath + '.js');
      const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
      await mod.default(req, res);
    } catch (err) {
      console.error(`[API] ${routePath}:`, err.message);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    }
  }

  // Auth
  apiApp.post('/api/auth/register', (req, res) => handle('auth/register', req, res));
  apiApp.post('/api/auth/login', (req, res) => handle('auth/login', req, res));
  apiApp.post('/api/auth/logout', (req, res) => handle('auth/logout', req, res));
  apiApp.get('/api/auth/me', (req, res) => handle('auth/me', req, res));

  // AI
  apiApp.post('/api/ai/generate', (req, res) => handle('ai/generate', req, res));
  apiApp.post('/api/ai/regenerate-deck', (req, res) => handle('ai/regenerate-deck', req, res));
  apiApp.post('/api/ai/edit-slide', (req, res) => handle('ai/edit-slide', req, res));
  apiApp.post('/api/ai/voice-command', (req, res) => handle('ai/voice-command', req, res));
  apiApp.post('/api/ai/bulk-improve', (req, res) => handle('ai/bulk-improve', req, res));

  // Privacy
  apiApp.get('/api/privacy/mask-count', (req, res) => handle('privacy/mask-count', req, res));
  apiApp.post('/api/privacy/inject-real-data', (req, res) => handle('privacy/inject-real-data', req, res));

  // Export
  apiApp.post('/api/export/pptx', (req, res) => handle('export/pptx', req, res));
  apiApp.post('/api/export/json', (req, res) => handle('export/json', req, res));

  // Upload
  apiApp.post('/api/upload/file', (req, res) => handle('upload/file', req, res));

  // Admin
  apiApp.get('/api/admin/users', (req, res) => handle('admin/users', req, res));
  apiApp.patch('/api/admin/users', (req, res) => handle('admin/users', req, res));
  apiApp.delete('/api/admin/users', (req, res) => handle('admin/users', req, res));
  apiApp.get('/api/admin/llm-keys', (req, res) => handle('admin/llm-keys', req, res));
  apiApp.put('/api/admin/llm-keys/:provider', (req, res) => handle('admin/llm-keys', req, res));
  apiApp.get('/api/admin/analytics', (req, res) => handle('admin/analytics', req, res));

  // Health
  apiApp.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString(), version: '1.0.0-beta' }));

  // Serve client static files
  const clientDist = isDev
    ? path.join(__dirname, '..', 'client', 'dist')
    : path.join(process.resourcesPath, 'client', 'dist');

  if (existsSync(clientDist) && existsSync(path.join(clientDist, 'index.html'))) {
    apiApp.use(express.static(clientDist));
    apiApp.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
        res.sendFile(path.join(clientDist, 'index.html'));
      } else { next(); }
    });
    console.log('[API] Serving client from:', clientDist);
  }

  return new Promise((resolve) => {
    apiApp.listen(apiPort, () => {
      console.log('[API] Running on http://localhost:' + apiPort);
      console.log('[API] Supabase:', BACKEND_CONFIG.supabaseUrl ? 'OK' : 'MISSING');
      resolve(apiPort);
    });
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400, height: 300, frame: false, transparent: true,
    resizable: false, alwaysOnTop: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  const splashPath = isDev
    ? path.join(__dirname, 'splash.html')
    : path.join(process.resourcesPath, 'electron', 'splash.html');
  splashWindow.loadFile(splashPath);
}

function createMainWindow() {
  const bounds = store.get('windowBounds');
  mainWindow = new BrowserWindow({
    width: bounds.width, height: bounds.height,
    minWidth: 1024, minHeight: 680, title: 'PoterDeck',
    icon: path.join(__dirname, 'icons', 'icon.ico'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true,
    },
  });

  // Custom menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'Settings', click: () => { mainWindow.webContents.send('navigate', 'settings'); } },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Ctrl+R', click: () => mainWindow.reload() },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'Ctrl+=', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Zoom Out', accelerator: 'Ctrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Reset Zoom', accelerator: 'Ctrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
      ],
    },
    { label: 'Help', submenu: [{ label: 'About PoterDeck', click: () => shell.openExternal('https://github.com/prasadn4ai/PoterDeck') }] },
  ];
  if (isDev) menuTemplate[1].submenu.push({ type: 'separator' }, { label: 'Dev Tools', accelerator: 'Ctrl+Shift+I', click: () => mainWindow.webContents.toggleDevTools() });
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // Microphone permissions for voice
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => cb(['media', 'microphone', 'audioCapture'].includes(permission)));
  session.defaultSession.setPermissionCheckHandler((wc, permission) => ['media', 'microphone', 'audioCapture'].includes(permission));

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else if (apiPort > 0) {
    mainWindow.loadURL(`http://localhost:${apiPort}`);
    mainWindow.webContents.on('did-fail-load', () => {
      mainWindow.loadFile(path.join(process.resourcesPath, 'client', 'dist', 'index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, 'client', 'dist', 'index.html'));
  }

  // Screenshot protection (free tier)
  mainWindow.setContentProtection(true);

  // External links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const [w, h] = mainWindow.getSize();
      store.set('windowBounds', { width: w, height: h });
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) { splashWindow.close(); splashWindow = null; }
    mainWindow.show();
  });
}

// IPC Handlers
ipcMain.handle('settings:get', () => ({
  googleApiKey: store.get('googleApiKey') ? '••••••••' : '',
  openaiApiKey: store.get('openaiApiKey') ? '••••••••' : '',
  anthropicApiKey: store.get('anthropicApiKey') ? '••••••••' : '',
  hasSupabase: true, hasJwt: true,
  hasGemini: !!store.get('googleApiKey'),
  hasOpenai: !!store.get('openaiApiKey'),
  hasAnthropic: !!store.get('anthropicApiKey'),
  hasAnyLLM: !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey'),
  firstRun: store.get('firstRun'),
}));

ipcMain.handle('settings:save', (event, settings) => {
  if (settings.googleApiKey && settings.googleApiKey !== '••••••••') store.set('googleApiKey', settings.googleApiKey);
  if (settings.openaiApiKey && settings.openaiApiKey !== '••••••••') store.set('openaiApiKey', settings.openaiApiKey);
  if (settings.anthropicApiKey && settings.anthropicApiKey !== '••••••••') store.set('anthropicApiKey', settings.anthropicApiKey);
  if (settings.firstRun !== undefined) store.set('firstRun', settings.firstRun);
  // Update env vars live
  if (store.get('googleApiKey')) process.env.GOOGLE_API_KEY = store.get('googleApiKey');
  if (store.get('openaiApiKey')) process.env.OPENAI_API_KEY = store.get('openaiApiKey');
  if (store.get('anthropicApiKey')) process.env.ANTHROPIC_API_KEY = store.get('anthropicApiKey');
  return { ok: true };
});

ipcMain.handle('settings:deleteKey', (event, keyName) => {
  store.set(keyName, '');
  process.env[keyName === 'googleApiKey' ? 'GOOGLE_API_KEY' : keyName === 'openaiApiKey' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'] = '';
  return { ok: true };
});

ipcMain.handle('settings:getApiPort', () => apiPort);

ipcMain.handle('settings:restartApi', async () => {
  // With in-process server, just update env vars (already done in settings:save)
  return { port: apiPort };
});

ipcMain.handle('settings:isConfigured', () => {
  return !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey');
});

// App lifecycle
app.whenReady().then(async () => {
  BACKEND_CONFIG = loadBackendConfig();
  console.log('[APP] Backend config loaded, Supabase:', !!BACKEND_CONFIG.supabaseUrl);

  createSplashWindow();

  // Always start the API server (backend config is bundled)
  try {
    await startApiServer();
    console.log('[APP] API server started on port', apiPort);
  } catch (err) {
    console.error('[APP] API server failed:', err.message);
    apiPort = 0;
  }

  createMainWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createMainWindow(); });

process.on('uncaughtException', (err) => console.error('[UNCAUGHT]', err.message));
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err?.message || err));
