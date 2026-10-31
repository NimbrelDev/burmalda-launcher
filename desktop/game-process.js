// Game process lifecycle: status, launch, kill and crash reporting
import { ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { appState } from './state.js';
import { loadSettings } from './settings.js';
import { findHorizonBinary, findResourcesDir, getModFile } from './game-files.js';
import { prepareHorizonResources } from './horizon-prepare.js';

export function registerGameProcessHandlers() {
  ipcMain.handle('get-status', () => {
    const settings = loadSettings();
    const binary = findHorizonBinary(settings.selectedVersion);
    const resources = findResourcesDir(settings.selectedVersion);
    return {
      isReady: Boolean(binary && resources),
      binaryPath: binary,
      resourcesPath: resources,
      isGameRunning: Boolean(appState.gameProcess && !appState.gameProcess.killed),
      currentVersion: settings.selectedVersion || 'v0.2.97',
    };
  });

  ipcMain.handle('launch-game', async (_, targetServer) => {
    if (appState.gameProcess && !appState.gameProcess.killed) {
      return { success: false, error: 'Игра уже запущена' };
    }

    const settings = loadSettings();
    const binary = findHorizonBinary(settings.selectedVersion);
    const resources = findResourcesDir(settings.selectedVersion);

    if (!binary || !resources) {
      return {
        success: false,
        error: `Файлы для версии ${settings.selectedVersion} не найдены. Откройте вкладку «Версии» и нажмите «Скачать версию».`
      };
    }

    // The engine refuses to start without its pinned prepared resources;
    // repair them right before launch if a previous install was interrupted.
    try {
      const versionDir = path.dirname(binary);
      const mcVersion = settings.selectedMcVersion || '26.3';
      const preparedDir = path.join(versionDir, '.local', 'horizon-client', mcVersion);
      // Complete preparation ends with horizon-resources.json; a partial dir
      // (interrupted prepare) must be rebuilt, not trusted.
      if (!fs.existsSync(path.join(preparedDir, 'horizon-resources.json'))) {
        await prepareHorizonResources(versionDir, mcVersion, ({ status }) => {
          appState.mainWindow?.webContents.send('game-log', `\n[лаунчер] ${status}\n`);
        });
      }
    } catch (prepErr) {
      return { success: false, error: `Не удалось подготовить ресурсы игры: ${prepErr.message}` };
    }

    const args = [
      '--resources', resources,
      '--name', settings.nickname || 'Player',
      '--render-distance', String(settings.renderDistance || 12),
      '--control',
    ];

    if (targetServer && typeof targetServer === 'string') {
      args.push('--server', targetServer);
    }

    if (settings.fullscreen) {
      args.push('--width', '1920', '--height', '1080');
    } else {
      const w = Math.max(1280, settings.width || 1280);
      const h = Math.max(720, settings.height || 720);
      args.push('--width', String(w), '--height', String(h));
    }

    // Attach addons from active modpack
    const activePack = (settings.modpacks || []).find(p => p.id === settings.activeModpackId) || settings.modpacks?.[0];
    const allAddons = new Set();

    if (activePack) {
      (activePack.mods || []).forEach(m => allAddons.add(m));
      (activePack.texturepacks || []).forEach(t => allAddons.add(t));
      (activePack.shaders || []).forEach(s => allAddons.add(s));
    } else if (Array.isArray(settings.activeMods)) {
      settings.activeMods.forEach(m => allAddons.add(m));
    }

    for (const item of allAddons) {
      const modPath = getModFile(item);
      if (modPath) {
        args.push('--dev-mod', modPath);
      }
    }

    // --skin arg not supported by this build

    if (settings.customArgs && typeof settings.customArgs === 'string') {
      const extra = settings.customArgs.trim().split(/\s+/).filter(Boolean);
      args.push(...extra);
    }

    try {
      const cwd = path.dirname(binary);
      const env = {
        ...process.env,
        ...(settings.preferDiscreteGpu ? {
          DRI_PRIME: '1',
          __NV_PRIME_RENDER_OFFLOAD: '1',
          __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
        } : {})
      };

      appState.gameProcess = spawn(binary, args, {
        cwd,
        env,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Hide the launcher while the game runs, bring it back when the game ends
      appState.mainWindow?.hide();
      appState.gameProcess.on('exit', () => {
        const win = appState.mainWindow;
        if (win && !win.isDestroyed()) {
          win.show();
          win.focus();
        }
      });

      let crashLog = '';
      // Persist the session log so crashes/lags can be diagnosed afterwards
      const logDir = path.join(path.dirname(binary), '..', 'logs');
      try { fs.mkdirSync(logDir, { recursive: true }); } catch (_) {}
      const logStream = fs.createWriteStream(path.join(logDir, `game-${new Date().toISOString().replace(/[:.]/g, '-')}.log`));
      const onGameOutput = (data) => {
        const s = data.toString();
        crashLog += s;
        logStream.write(s);
        appState.mainWindow?.webContents.send('game-log', s);
      };
      appState.gameProcess.stdout.on('data', onGameOutput);
      appState.gameProcess.stderr.on('data', onGameOutput);
      appState.gameProcess.on('exit', () => { try { logStream.end(); } catch (_) {} });

      appState.gameProcess.on('exit', (code) => {
        appState.gameProcess = null;
        appState.mainWindow?.webContents.send('game-exit', code);
        if (code !== 0 && code !== null) {
          // Show crash reason to user
          const tail = crashLog.split('\n').slice(-15).join('\n');
          appState.mainWindow?.webContents.send('game-log', `\n=== CRASH (exit ${code}) ===\n${tail}`);
          dialog.showMessageBox(appState.mainWindow, {
            type: 'error',
            title: 'Игра вылетела',
            message: `Код выхода: ${code}`,
            detail: tail.slice(-800),
            buttons: ['OK'],
          });
        }
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('kill-game', () => {
    if (appState.gameProcess && !appState.gameProcess.killed) {
      appState.gameProcess.kill('SIGTERM');
      appState.gameProcess = null;
      return true;
    }
    return false;
  });
}
