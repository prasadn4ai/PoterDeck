import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { spawn } from 'child_process';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

const store = new Store({
  name: 'poterdeck-config',
  defaults: {
    supabaseUrl: '',
    supabaseKey: '',
    jwtSecret: '',
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

  const envVars = {
    ...process.env,
    PORT: String(apiPort),
    NODE_ENV: 'production',
    SUPABASE_URL: store.get('supabaseUrl'),
    SUPABASE_SERVICE_KEY: store.get('supabaseKey'),
    JWT_SECRET: store.get('jwtSecret'),
    GOOGLE_API_KEY: store.get('googleApiKey'),
    OPENAI_API_KEY: store.get('openaiApiKey'),
    ANTHROPIC_API_KEY: store.get('anthropicApiKey'),
    ALLOWED_ORIGINS: `http://localhost:${apiPort}`,
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

  // Wait for server to be ready
  return new Promise((resolve) => {
    const check = () => {
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

  // Load the app
  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173`);
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, 'client', 'dist', 'index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) { splashWindow.close(); splashWindow = null; }
    mainWindow.show();
  });
}

// IPC Handlers for Settings
ipcMain.handle('settings:get', () => {
  return {
    supabaseUrl: store.get('supabaseUrl'),
    supabaseKey: store.get('supabaseKey') ? '••••••••' : '',
    jwtSecret: store.get('jwtSecret') ? '••••••••' : '',
    googleApiKey: store.get('googleApiKey') ? '••••••••' : '',
    openaiApiKey: store.get('openaiApiKey') ? '••••••••' : '',
    anthropicApiKey: store.get('anthropicApiKey') ? '••••••••' : '',
    hasSupabase: !!store.get('supabaseUrl') && !!store.get('supabaseKey'),
    hasJwt: !!store.get('jwtSecret'),
    hasGemini: !!store.get('googleApiKey'),
    hasOpenai: !!store.get('openaiApiKey'),
    hasAnthropic: !!store.get('anthropicApiKey'),
    hasAnyLLM: !!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey'),
    firstRun: store.get('firstRun'),
  };
});

ipcMain.handle('settings:save', (event, settings) => {
  if (settings.supabaseUrl !== undefined) store.set('supabaseUrl', settings.supabaseUrl);
  if (settings.supabaseKey !== undefined && settings.supabaseKey !== '••••••••') store.set('supabaseKey', settings.supabaseKey);
  if (settings.jwtSecret !== undefined && settings.jwtSecret !== '••••••••') store.set('jwtSecret', settings.jwtSecret);
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
  return !!store.get('supabaseUrl') && !!store.get('supabaseKey') && !!store.get('jwtSecret') &&
    (!!store.get('googleApiKey') || !!store.get('openaiApiKey') || !!store.get('anthropicApiKey'));
});

// App lifecycle
app.whenReady().then(async () => {
  createSplashWindow();

  const isConfigured = !!store.get('supabaseUrl') && !!store.get('supabaseKey') && !!store.get('jwtSecret');

  if (isConfigured) {
    try {
      await startApiServer();
    } catch (err) {
      console.error('Failed to start API server:', err);
    }
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
