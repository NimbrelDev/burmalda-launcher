// Core IPC handlers: settings, versions catalog, update/broadcast checks,
// external links and native folder opening
import { app, ipcMain, dialog, shell } from 'electron';
import { spawn } from 'child_process';
import { GAME_DIR, SAVES_DIR, MODS_DIR, VERSIONS_DIR, SKINS_DIR } from './paths.js';
import { appState } from './state.js';
import { loadSettings, saveSettings } from './settings.js';
import { UPDATE_CONFIG_URLS, BROADCAST_CONFIG_URLS, fetchHighestVersionConfig, fetchBroadcastFromPrimary, compareSemver } from './remote-config.js';
import { fetchOnlineReleases } from './releases.js';
import { findHorizonBinary } from './game-files.js';

export function registerCoreHandlers() {
  // IPC Handlers
  ipcMain.handle('get-settings', () => loadSettings());
  ipcMain.handle('save-settings', (_, settings) => saveSettings(settings));

  ipcMain.handle('get-versions', async () => {
    const releases = await fetchOnlineReleases();
    const settings = loadSettings();

    const formattedVersions = releases.map(r => {
      const isNightly = Boolean(r.prerelease || (r.tag && r.tag.includes('nightly')));
      const supported = r.supportedMcVersions && r.supportedMcVersions.length > 0 ? r.supportedMcVersions : ['26.3'];
      const defMc = r.defaultMcVersion || supported[supported.length - 1] || '26.3';
      return {
        id: r.id || r.tag,
        tag: r.tag,
        name: r.name || `Horizon ${r.tag}`,
        prerelease: isNightly,
        channel: isNightly ? 'nightly' : 'stable',
        status: isNightly ? 'Nightly' : 'Релиз',
        supportedMcVersions: supported,
        defaultMcVersion: defMc,
        publishedAt: r.publishedAt || (r.published_at || '').split('T')[0] || '',
        isInstalled: Boolean(findHorizonBinary(r.tag)),
        isActive: r.tag === (settings.selectedVersion || 'v0.2.97'),
        assets: r.assets || [],
      };
    });

    const activeTag = settings.selectedVersion || (formattedVersions[0]?.tag || 'v0.2.97');
    const activeVerObj = formattedVersions.find(v => v.tag === activeTag) || formattedVersions[0];
    const activeSupported = activeVerObj?.supportedMcVersions || ['26.3'];

    let activeMcVersion = settings.selectedMcVersion;
    if (!activeMcVersion || !activeSupported.includes(activeMcVersion)) {
      activeMcVersion = activeVerObj?.defaultMcVersion || activeSupported[activeSupported.length - 1] || '26.3';
    }

    const mcVersionList = activeSupported.map(v => ({
      id: v,
      name: `Minecraft ${v}`,
      description: `Поддерживаемая версия Horizon`
    }));

    return {
      minecraftVersions: mcVersionList,
      selectedMcVersion: activeMcVersion,
      activeVersion: activeTag,
      latestStableTag: formattedVersions.find(v => !v.prerelease)?.tag || activeTag,
      versions: formattedVersions,
    };
  });

  ipcMain.handle('select-file', async (_, options = {}) => {
    const result = await dialog.showOpenDialog(appState.mainWindow, {
      title: options.title || 'Выберите файл',
      filters: options.filters || [{ name: 'Все файлы', extensions: ['*'] }],
      properties: ['openFile']
    });
    if (result.canceled || !result.filePaths.length) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('set-version', (_, versionTag, mcVersion) => {
    const settings = loadSettings();
    settings.selectedVersion = versionTag;
    if (mcVersion) settings.selectedMcVersion = mcVersion;
    saveSettings(settings);
    return { success: true, activeVersion: versionTag, selectedMcVersion: settings.selectedMcVersion };
  });

  ipcMain.handle('set-mc-version', (_, mcVersion) => {
    const settings = loadSettings();
    settings.selectedMcVersion = mcVersion;
    saveSettings(settings);
    return { success: true, selectedMcVersion: mcVersion };
  });

  // Check launcher version update & minimum required version (remote kill-switch/lock)
  // Authoritative version is chosen by comparing mirrors: whichever mirror reports higher version wins
  ipcMain.handle('check-launcher-update', async () => {
    const currentVersion = app.getVersion() || '1.0.0';
    const settings = loadSettings();
    const urls = [
      settings.customUpdateUrl,
      ...UPDATE_CONFIG_URLS,
    ].filter(Boolean);

    const remoteData = await fetchHighestVersionConfig(urls);
    if (!remoteData) {
      return {
        checked: false,
        currentVersion,
        isBlocked: false,
        hasUpdate: false,
      };
    }

    const latestVersion = remoteData.latestVersion || currentVersion;
    const minSupportedVersion = remoteData.minSupportedVersion || '0.0.0';
    const downloadUrl = remoteData.downloadUrl || 'https://burmalda.ru';

    const isBlocked = compareSemver(currentVersion, minSupportedVersion) < 0;
    const hasUpdate = compareSemver(currentVersion, latestVersion) < 0;

    return {
      checked: true,
      currentVersion,
      latestVersion,
      minSupportedVersion,
      isBlocked,
      hasUpdate,
      downloadUrl,
      title: remoteData.title || 'Доступно обновление',
      message: remoteData.message || `Доступна новая версия лаунчера: ${latestVersion}.`,
      blockedTitle: remoteData.blockedTitle || 'ВЕРСИЯ УСТАРЕЛА',
      blockedMessage: remoteData.blockedMessage || 'Данная версия лаунчера заблокирована разработчиками. Пожалуйста, скачайте официальное обновление с нашего сайта.',
    };
  });

  // Check broadcast announcement message for players.
  // Primary source: GitFlic. If primary has 404 (file removed), NO announcement is shown.
  // Codeberg acts purely as backup standby when primary has a network failure.
  ipcMain.handle('check-broadcast-message', async () => {
    const settings = loadSettings();
    const primaryUrl = settings.customBroadcastUrl || BROADCAST_CONFIG_URLS[0];
    const backupUrl = BROADCAST_CONFIG_URLS[1] || null;

    const remoteData = await fetchBroadcastFromPrimary(primaryUrl, backupUrl);
    if (!remoteData || !remoteData.message) {
      return { hasMessage: false };
    }

    return {
      hasMessage: true,
      id: String(remoteData.id || remoteData.message.slice(0, 16)),
      title: remoteData.title || 'ОБЪЯВЛЕНИЕ',
      message: remoteData.message,
      buttonText: remoteData.buttonText || null,
      buttonUrl: remoteData.buttonUrl || null,
      canClose: remoteData.canClose !== false,
    };
  });

  // Securely open external URL in player's default web browser
  ipcMain.handle('open-external-url', async (_, rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return false;
    try {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        await shell.openExternal(rawUrl);
        return true;
      }
    } catch (err) {
      console.warn('Failed to open external url:', err.message);
    }
    return false;
  });

  ipcMain.handle('rollback-version', async () => {
    const releases = await fetchOnlineReleases();
    const latestStable = releases.find(r => !r.prerelease) || releases[0];
    const settings = loadSettings();
    settings.selectedVersion = latestStable.tag;
    saveSettings(settings);
    return { success: true, activeVersion: latestStable.tag };
  });

  // Real Folder Opener (Native Graphical File Manager)
  ipcMain.handle('open-folder', async (_, folderType) => {
    let target = GAME_DIR;
    if (folderType === 'saves') target = SAVES_DIR;
    else if (folderType === 'mods') target = MODS_DIR;
    else if (folderType === 'versions') target = VERSIONS_DIR;
    else if (folderType === 'skins') target = SKINS_DIR;
  
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

    if (process.platform === 'linux') {
      // Specifically target graphical file managers to prevent opening terminal in Hyprland
      const graphicalManagers = ['nautilus', 'dolphin', 'thunar', 'nemo', 'pcmanfm'];
      for (const mgr of graphicalManagers) {
        try {
          const mgrPath = execSync(`which ${mgr} 2>/dev/null`).toString().trim();
          if (mgrPath) {
            spawn(mgrPath, [target], { detached: true, stdio: 'ignore' }).unref();
            return { success: true, path: target, manager: mgr };
          }
        } catch (_) {}
      }
    }

    await shell.openPath(target);
    return { success: true, path: target };
  });
}
