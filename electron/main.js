import { app, BrowserWindow, ipcMain, shell, Menu, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { spawn } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

// Force high DPI support for sharp rendering on all displays
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

// Backend infrastructure — loaded from bundled config (not user-configurable)
import { readFileSync, existsSync } from 'fs';

let BACKEND_CONFIG = { supabaseUrl: '', supabaseKey: '', jwtSecret: '' };
const configPaths = [
  path.join(__dirname, '..', 'backend.config.json'),       // dev
  path.join(__dirname, 'backend.config.json'),              // dev alt
  path.join(process.resourcesPath || '', 'backend.config.json'),  // packaged
];
for (const p of configPaths) {
  if (existsSync(p)) {
    try { BACKEND_CONFIG = JSON.parse(readFileSync(p, 'utf-8')); break; } catch {}
  }
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
let apiProcess = null;
let apiPort = 3000;

// Find an available port
function findPort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findPort(startPort + 1)));
  });
}

// Start embedded API server
async function startApiServer() {
  apiPort = await findPort(3000);

  const clientDist = isDev
    ? path.join(__dirname, '..', 'client', 'dist')
    : path.join(process.resourcesPath, 'client', 'dist');

  const envVars = {
    ...process.env,
    PORT: String(apiPort),
    NODE_ENV: 'production',
    SUPABASE_URL: BACKEND_CONFIG.supabaseUrl,
    SUPABASE_SERVICE_KEY: BACKEND_CONFIG.supabaseKey,
    JWT_SECRET: BACKEND_CONFIG.jwtSecret,
    GOOGLE_API_KEY: store.get('googleApiKey'),
    OPENAI_API_KEY: store.get('openaiApiKey'),
    ANTHROPIC_API_KEY: store.get('anthropicApiKey'),
    ALLOWED_ORIGINS: `http://localhost:${apiPort}`,
    POTERDECK_CLIENT_DIST: clientDist,
  };

  const serverPath = isDev
    ? path.join(__dirname, '..', 'dev-server.js')
    : path.join(process.resourcesPath, 'server', 'dev-server.js');

  apiProcess = spawn('node', [serverPath], {
    env: envVars,
    cwd: isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'server'),
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  apiProcess.stdout.on('data', (data) => console.log('[API]', data.toString().trim()));
  apiProcess.stderr.on('data', (data) => console.error('[API ERR]', data.toString().trim()));

  // Wait for server to be ready (with timeout)
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max
    const check = () => {
      attempts++;
      if (attempts > maxAttempts) {
        console.error('[API] Server failed to start after', maxAttempts, 'attempts');
        resolve(apiPort); // resolve anyway so app isn't stuck
        return;
      }
      fetch(`http://localhost:${apiPort}/api/health`)
        .then((r) => r.json())
        .then(() => resolve(apiPort))
        .catch(() => setTimeout(check, 500));
    };
    setTimeout(check, 1000);
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
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
    width: bounds.width,
    height: bounds.height,
    minWidth: 1024,
    minHeight: 680,
    title: 'PoterDeck',
    icon: path.join(__dirname, 'icons', 'icon.ico'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Custom application menu with working Exit
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'Settings', click: () => { mainWindow.webContents.send('navigate', 'settings'); } },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'Alt+F4', click: () => { app.quit(); } },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Ctrl+R', click: () => { mainWindow.reload(); } },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => { mainWindow.setFullScreen(!mainWindow.isFullScreen()); } },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'Ctrl+=', click: () => { mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5); } },
        { label: 'Zoom Out', accelerator: 'Ctrl+-', click: () => { mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5); } },
        { label: 'Reset Zoom', accelerator: 'Ctrl+0', click: () => { mainWindow.webContents.setZoomLevel(0); } },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About PoterDeck', click: () => { shell.openExternal('https://github.com/prasadn4ai/PoterDeck'); } },
      ],
    },
  ];
  if (isDev) {
    menuTemplate[1].submenu.push({ type: 'separator' }, { label: 'Dev Tools', accelerator: 'Ctrl+Shift+I', click: () => { mainWindow.webContents.toggleDevTools(); } });
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // Grant microphone permission for Web Speech API (voice commands)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'audioCapture'].includes(permission);
    callback(allowed);
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return ['media', 'microphone', 'audioCapture'].includes(permission);
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173`);
  } else if (apiPort > 0) {
    // API running: load via http:// (enables voice via Web Speech API)
    const appUrl = `http://localhost:${apiPort}`;
    mainWindow.loadURL(appUrl);
    mainWindow.webContents.on('did-fail-load', () => {
      console.log('[APP] HTTP load failed, falling back to file://');
      mainWindow.loadFile(path.join(process.resourcesPath, 'client', 'dist', 'index.html'));
    });
  } else {
    // No API: load directly from file (Settings page will show for first-run setup)
    console.log('[APP] No API server, loading from file://');
    mainWindow.loadFile(path.join(process.resourcesPath, 'client', 'dist', 'index.html'));
  }

  // Screenshot protection for free tier (OS-level: window appears black in screenshots)
  // Premium users: protection disabled
  mainWindow.setContentProtection(true);

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const [width, height] = mainWindow.getSize();
      store.set('windowBounds', { width, height });
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) { splashWindow.close(); splashWindow = null; }
    mainWindow.show();
  });
}

// IPC Handlers for Settings (only LLM keys — Supabase/JWT managed internally)
ipcMain.handle('settings:get', () => {
  return {
    googleApiKey: store.get('googleApiKey') ? '••••••••' : '',
    openaiApiKey: store.get('openaiApiKey') ? '••••••••' : '',
    anthropicApiKey: store.get('anthropicApiKey') ? '••••••••' : '',
    hasSupabase: true, // always configured (bundled)
    hasJwt: true,      // always configured (bundled)
    hasGemini: !!store.get('googleApiKey'),
    hasOpenai: !!store.get('openaiApiKey'),
    hasAnthropic: !!store.get('anthropicApiKey'),
    hasAnyLLM: !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey'),
    firstRun: store.get('firstRun'),
  };
});

ipcMain.handle('settings:save', (event, settings) => {
  if (settings.googleApiKey !== undefined && settings.googleApiKey !== '••••••••') store.set('googleApiKey', settings.googleApiKey);
  if (settings.openaiApiKey !== undefined && settings.openaiApiKey !== '••••••••') store.set('openaiApiKey', settings.openaiApiKey);
  if (settings.anthropicApiKey !== undefined && settings.anthropicApiKey !== '••••••••') store.set('anthropicApiKey', settings.anthropicApiKey);
  if (settings.firstRun !== undefined) store.set('firstRun', settings.firstRun);
  return { ok: true };
});

ipcMain.handle('settings:deleteKey', (event, keyName) => {
  store.set(keyName, '');
  return { ok: true };
});

ipcMain.handle('settings:getApiPort', () => apiPort);

ipcMain.handle('settings:restartApi', async () => {
  if (apiProcess) { apiProcess.kill(); apiProcess = null; }
  const port = await startApiServer();
  return { port };
});

ipcMain.handle('settings:isConfigured', () => {
  // Only need at least one LLM key — Supabase/JWT are bundled
  return !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey');
});

// App lifecycle
app.whenReady().then(async () => {
  createSplashWindow();

  const isConfigured = !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey');
  let apiStarted = false;

  if (isConfigured) {
    try {
      await startApiServer();
      apiStarted = true;
    } catch (err) {
      console.error('Failed to start API server:', err);
    }
  }

  // If API didn't start, ensure we fall back to file:// loading
  if (!apiStarted) {
    apiPort = 0; // signal to createMainWindow to use file://
  }

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (apiProcess) { apiProcess.kill(); apiProcess = null; }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('before-quit', () => {
  if (apiProcess) { apiProcess.kill(); apiProcess = null; }
});
