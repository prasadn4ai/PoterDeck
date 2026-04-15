const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  deleteKey: (keyName) => ipcRenderer.invoke('settings:deleteKey', keyName),
  getApiPort: () => ipcRenderer.invoke('settings:getApiPort'),
  restartApi: () => ipcRenderer.invoke('settings:restartApi'),
  isConfigured: () => ipcRenderer.invoke('settings:isConfigured'),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
