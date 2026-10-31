// Burmalda Launcher — Electron main process entry point.
// Feature logic lives in sibling modules (./settings.js, ./releases.js, ./game-*.js,
// ./ipc-*.js). Entry point path is fixed by package.json ("main": "desktop/main.js").
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { __dirname, SRC_DIR } from './paths.js';
import { appState } from './state.js';
import { loadSettings } from './settings.js';
import { registerCoreHandlers } from './ipc-core.js';
import { registerSkinHandlers } from './ipc-skins.js';
import { registerModHandlers } from './ipc-mods.js';
import { registerSystemHandlers } from './ipc-system.js';
import { registerVersionDownloadHandler } from './version-download.js';
import { registerGameProcessHandlers } from './game-process.js';

let mainWindow = null;

function createWindow() {
  const settings = loadSettings();
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 700,
    minWidth: 640,
    minHeight: 480,
    frame: false,
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: settings.brandName || 'Burmalda Launcher',
  });
  appState.mainWindow = mainWindow;

  mainWindow.loadFile(path.join(SRC_DIR, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
registerCoreHandlers();
registerSkinHandlers();
registerModHandlers();
registerSystemHandlers();
registerVersionDownloadHandler();
registerGameProcessHandlers();

// Window controls
ipcMain.on('window-min', () => appState.mainWindow?.minimize());
ipcMain.on('window-max', () => {
  if (appState.mainWindow?.isMaximized()) appState.mainWindow.unmaximize();
  else appState.mainWindow?.maximize();
});
ipcMain.on('window-close', () => appState.mainWindow?.close());
