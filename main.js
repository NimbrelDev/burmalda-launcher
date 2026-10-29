import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawn, execFile } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directories in ~/.zenith-launcher
const USER_DATA = app.getPath('userData');
const GAME_DIR = path.join(process.env.HOME || USER_DATA, '.zenith-launcher');
const SETTINGS_FILE = path.join(GAME_DIR, 'settings.json');
const VERSIONS_DIR = path.join(GAME_DIR, 'versions');
const SAVES_DIR = path.join(GAME_DIR, 'saves');
const MODS_DIR = path.join(GAME_DIR, 'mods');
const SKINS_DIR = path.join(GAME_DIR, 'skins');
const RESOURCES_DIR = path.join(GAME_DIR, 'resources');
const RELEASES_CACHE_FILE = path.join(GAME_DIR, 'releases_cache.json');
const FRIENDS_FILE = path.join(GAME_DIR, 'friends.json');
const MOD_DATA_DIR = path.join(process.env.HOME || USER_DATA, '.horizon-mod-data', 'mobile_touch_controls');
const TOUCH_SETTINGS_FILE = path.join(MOD_DATA_DIR, 'settings.json');

// Ensure base directories exist
for (const dir of [GAME_DIR, VERSIONS_DIR, SAVES_DIR, MODS_DIR, SKINS_DIR, RESOURCES_DIR, MOD_DATA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

let mainWindow = null;
let gameProcess = null;

// Supported Minecraft base versions (Strictly Minecraft 26.3 for Horizon)
const MINECRAFT_BASE_VERSIONS = [
  { id: '26.3', name: 'Minecraft 26.3', description: 'Официальная поддерживаемая версия Horizon' }
];

function loadBundledReleases() {
  try {
    const bundledPath = path.join(__dirname, 'src', 'assets', 'horizon_releases.json');
    if (fs.existsSync(bundledPath)) {
      return JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
    }
  } catch (_) {}
  return [];
}

const DEFAULT_RELEASES = loadBundledReleases();

function loadSettings() {
  const defaults = {
    brandName: 'R-Launcher',
    brandTag: '',
    nickname: 'Player',
    selectedVersion: 'v0.2.97',
    selectedMcVersion: '26.3',
    activeModpackId: 'vanilla',
    modpacks: [
      {
        id: 'vanilla',
        name: 'Ванилла',
        version: '26.3',
        isDefault: true,
        description: 'Чистый официальный клиент Horizon 0.2.97',
        mods: [],
        texturepacks: [],
        shaders: []
      },
      {
        id: 'pvp-boost',
        name: 'PVP & Оптимизация',
        version: '26.3',
        isDefault: false,
        description: 'Оптимизация рендера, высокий FPS и шейдеры',
        mods: ['Sodium (Оптимизация)', 'Iris (Шейдеры)', 'FastCraft (Ускорение)'],
        texturepacks: ['Faithful 32x'],
        shaders: ['Complementary Reimagined']
      }
    ],
    skinPath: null,
    skinDataUrl: null,
    skinName: 'Стив',
    skinModel: 'default',
    wardrobe: [],
    ramMb: 4096,
    customArgs: '',
    preferDiscreteGpu: true,
    fpsLimit: 0,
    fullscreen: false,
    width: 1280,
    height: 720,
    activeMods: ['coords-hud', 'zoom', 'fps-overlay'],
    autoUpdate: true,
  };

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      if (data.selectedVersion === 'horizon-26.3-stable' || !data.selectedVersion || data.selectedVersion === 'v0.2.93') {
        data.selectedVersion = 'v0.2.97';
      }
      if (!data.selectedMcVersion) {
        data.selectedMcVersion = '26.3';
      }
      if (!data.modpacks || !Array.isArray(data.modpacks)) {
        data.modpacks = defaults.modpacks;
      }
      if (!data.activeModpackId) {
        data.activeModpackId = 'vanilla';
      }
      return { ...defaults, ...data };
    }
  } catch (err) {
    console.error('Failed reading settings:', err);
  }
  return defaults;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    if (mainWindow && settings.brandName) {
      mainWindow.setTitle(settings.brandName);
    }
    return true;
  } catch (err) {
    console.error('Failed writing settings:', err);
    return false;
  }
}

// Check if a specific version tag is installed strictly in ~/.zenith-launcher/versions/<tag>/
function isVersionInstalled(tag) {
  if (!tag) return false;
  const vDir = path.join(VERSIONS_DIR, tag);
  const binaryName = process.platform === 'win32' ? 'horizon-client.exe' : 'horizon-client';
  return fs.existsSync(path.join(vDir, binaryName)) ||
         fs.existsSync(path.join(vDir, 'horizon-windows-x64', binaryName)) ||
         fs.existsSync(path.join(vDir, 'horizon-linux-x86_64', binaryName));
}

// Find binary strictly for the chosen version in ~/.zenith-launcher/versions/<tag>/
function findHorizonBinary(versionTag) {
  const tag = versionTag || loadSettings().selectedVersion;
  if (!tag) return null;
  const binaryName = process.platform === 'win32' ? 'horizon-client.exe' : 'horizon-client';
  
  const candidates = [
    path.join(VERSIONS_DIR, tag, binaryName),
    path.join(VERSIONS_DIR, tag, 'horizon-windows-x64', binaryName),
    path.join(VERSIONS_DIR, tag, 'horizon-linux-x86_64', binaryName),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// Find resources directory for the chosen version
function findResourcesDir(versionTag) {
  const tag = versionTag || loadSettings().selectedVersion || 'v0.2.93';
  const candidates = [
    path.join(VERSIONS_DIR, tag, 'resources'),
    RESOURCES_DIR,
    path.join(VERSIONS_DIR, 'v0.2.93', 'resources'),
    '/home/roman/horizon-dist/game-bundle-linux/resources',
    '/home/roman/horizon/horizon-linux-x86_64/.local/horizon-client/26.3',
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.existsSync(path.join(c, 'asset-index.json'))) return c;
    if (fs.existsSync(c) && fs.existsSync(path.join(c, 'horizon-resources.json'))) return c;
  }
  return null;
}

function getModFile(modKey) {
  const mapping = {
    'coords-hud': 'coords_hud-0.1.0.hmod',
    'coords_hud': 'coords_hud-0.1.0.hmod',
    'zoom': 'zoom-0.1.0.hmod',
    'fps-overlay': 'fps_overlay-0.1.0.hmod',
    'fps_overlay': 'fps_overlay-0.1.0.hmod',
    'keystrokes': 'keystrokes-0.1.0.hmod',
    'recipes': 'cozy-1.0.0.hpack',
  };

  const filename = mapping[modKey] || `${modKey}.hmod`;
  const searchDirs = [
    MODS_DIR,
    '/home/roman/horizon-dist/website/api/mods/files',
    '/home/roman/horizon/horizon-main/crates/horizon-mods/tests/index',
  ];

  for (const dir of searchDirs) {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function cleanReleaseDescription(text, isNightly) {
  if (!text) return isNightly ? 'Экспериментальная сборка Nightly.' : 'Стабильный релиз движка Horizon.';
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown link to text
    .replace(/[#*`_~]/g, '') // remove markdown markup
    .replace(/\s+/g, ' ')
    .trim();
}

// Dynamic GitHub Releases Parser with instant cache serving
async function fetchOnlineReleases() {
  // If local cache exists, serve instantly for instant UI rendering!
  if (fs.existsSync(RELEASES_CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(RELEASES_CACHE_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 0) {
        // Trigger background update without delaying UI
        setTimeout(fetchFreshReleases, 100);
        return cached;
      }
    } catch (_) {}
  }

  return await fetchFreshReleases();
}

async function fetchFreshReleases() {
  try {
    const response = await fetch('https://api.github.com/repos/horizon-rust/horizon/releases?per_page=30', {
      headers: {
        'User-Agent': 'Zenith-Launcher/1.0 (Linux; x86_64)',
        'Accept': 'application/vnd.github.v3+json',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned HTTP ${response.status}`);
    }

    const rawReleases = await response.json();
    if (!Array.isArray(rawReleases)) {
      throw new Error('Invalid JSON format from GitHub API');
    }

    // Filter out tags starting with launcher@
    const filtered = rawReleases.filter(r => !r.tag_name.startsWith('launcher@'));

    const parsed = filtered.map(r => {
      const isNightly = Boolean(r.prerelease || r.tag_name.includes('nightly'));
      const cleanName = r.name || `Horizon ${r.tag_name}`;
      return {
        id: r.tag_name,
        tag: r.tag_name,
        name: cleanName,
        prerelease: isNightly,
        channel: isNightly ? 'nightly' : 'stable',
        status: isNightly ? 'Тестовая (Nightly)' : 'Стабильная (Stable)',
        publishedAt: (r.published_at || '').split('T')[0] || '2026-10-28',
        description: cleanReleaseDescription(r.body, isNightly),
        assets: (r.assets || []).map(a => ({
          name: a.name,
          size: a.size,
          sizeFormatted: `${Math.round((a.size || 0) / (1024 * 1024))} МБ`,
          downloadUrl: a.browser_download_url,
        })),
      };
    });

    if (parsed.length > 0) {
      fs.writeFileSync(RELEASES_CACHE_FILE, JSON.stringify(parsed, null, 2));
      return parsed;
    }
  } catch (err) {
    console.warn('GitHub Releases fetch note:', err.message);
  }

  // Fallback to cache file if present
  try {
    if (fs.existsSync(RELEASES_CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(RELEASES_CACHE_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
  } catch (_) {}

  return DEFAULT_RELEASES;
}

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
    title: settings.brandName || 'Zenith Launcher',
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
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
ipcMain.handle('get-settings', () => loadSettings());
ipcMain.handle('save-settings', (_, settings) => saveSettings(settings));

ipcMain.handle('get-versions', async () => {
  const releases = await fetchOnlineReleases();
  const settings = loadSettings();
  
  // Horizon 0.2.97 strictly
  const targetTag = 'v0.2.97';
  const found = releases.find(r => r.tag === targetTag || r.tag === '0.2.97') || {
    tag: 'v0.2.97',
    name: 'Horizon 0.2.97: Prepare, signs and 16 more fixes',
    prerelease: false,
    published_at: new Date().toISOString()
  };
  const activeVerTag = targetTag;

  return {
    minecraftVersions: MINECRAFT_BASE_VERSIONS,
    selectedMcVersion: '26.3',
    activeVersion: activeVerTag,
    latestStableTag: activeVerTag,
    versions: [{
      ...found,
      tag: targetTag,
      name: 'Horizon 0.2.97',
      isInstalled: isVersionInstalled(targetTag),
      isActive: true,
      prerelease: false
    }]
  };
});

ipcMain.handle('select-file', async (_, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Выберите файл',
    filters: options.filters || [{ name: 'Все файлы', extensions: ['*'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

ipcMain.handle('set-version', (_, versionTag, mcVersion = '26.3') => {
  const settings = loadSettings();
  settings.selectedVersion = versionTag;
  settings.selectedMcVersion = mcVersion;
  saveSettings(settings);
  return { success: true, activeVersion: versionTag, selectedMcVersion: mcVersion };
});

ipcMain.handle('rollback-version', async () => {
  const releases = await fetchOnlineReleases();
  const latestStable = releases.find(r => !r.prerelease) || releases[0];
  const settings = loadSettings();
  settings.selectedVersion = latestStable.tag;
  saveSettings(settings);
  return { success: true, activeVersion: latestStable.tag };
});

// Profile: Skin selector dialog
ipcMain.handle('select-skin', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите скин игрока (.png)',
    filters: [
      { name: 'PNG Images', extensions: ['png'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const selectedPath = result.filePaths[0];
  try {
    const destSkin = path.join(SKINS_DIR, 'current_skin.png');
    fs.copyFileSync(selectedPath, destSkin);

    const fileBuffer = fs.readFileSync(destSkin);
    const skinDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`;

    const settings = loadSettings();
    settings.skinPath = destSkin;
    settings.skinDataUrl = skinDataUrl;
    saveSettings(settings);

    return { success: true, skinPath: destSkin, skinDataUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-skin', () => {
  const settings = loadSettings();
  let skinPath = settings.skinPath;
  let skinDataUrl = settings.skinDataUrl;

  const defaultStevePath = path.join(__dirname, 'src', 'assets', 'steve.png');

  if (!skinDataUrl || !skinPath || !fs.existsSync(skinPath)) {
    if (fs.existsSync(defaultStevePath)) {
      skinPath = defaultStevePath;
      const fileBuffer = fs.readFileSync(defaultStevePath);
      skinDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`;
    }
  }

  return {
    skinPath,
    skinDataUrl,
    skinName: settings.skinName || 'Стив',
    skinModel: settings.skinModel || 'default',
    isDefaultSteve: !settings.skinPath || settings.skinPath === defaultStevePath
  };
});

const DEFAULT_SKINS = [
  { id: 'steve', name: 'Стив', model: 'default', filename: 'steve.png' },
  { id: 'alex', name: 'Алекс', model: 'slim', filename: 'alex.png' },
  { id: 'noor', name: 'Нур', model: 'default', filename: 'noor.png' },
  { id: 'sunny', name: 'Санни', model: 'default', filename: 'sunny.png' },
  { id: 'ari', name: 'Ари', model: 'default', filename: 'ari.png' },
  { id: 'zuri', name: 'Зури', model: 'default', filename: 'zuri.png' },
  { id: 'makena', name: 'Макена', model: 'default', filename: 'makena.png' },
  { id: 'kai', name: 'Кай', model: 'default', filename: 'kai.png' },
  { id: 'efe', name: 'Эфе', model: 'default', filename: 'efe.png' },
];

ipcMain.handle('get-default-skins', () => {
  const skinsDir = path.join(__dirname, 'src', 'assets', 'default_skins');
  return DEFAULT_SKINS.map(s => {
    const skinPath = path.join(skinsDir, s.filename);
    let dataUrl = null;
    if (fs.existsSync(skinPath)) {
      dataUrl = `data:image/png;base64,${fs.readFileSync(skinPath).toString('base64')}`;
    }
    return { ...s, dataUrl };
  });
});

ipcMain.handle('select-default-skin', (_, skinId) => {
  const found = DEFAULT_SKINS.find(s => s.id === skinId) || DEFAULT_SKINS[0];
  const skinPath = path.join(__dirname, 'src', 'assets', 'default_skins', found.filename);
  const dataUrl = `data:image/png;base64,${fs.readFileSync(skinPath).toString('base64')}`;

  const settings = loadSettings();
  settings.skinPath = skinPath;
  settings.skinDataUrl = dataUrl;
  settings.skinName = found.name;
  settings.skinModel = found.model;
  saveSettings(settings);

  return { success: true, skinPath, skinDataUrl: dataUrl, skinName: found.name, skinModel: found.model, isDefault: true };
});

ipcMain.handle('reset-skin', () => {
  const settings = loadSettings();
  const defaultStevePath = path.join(__dirname, 'src', 'assets', 'steve.png');
  settings.skinPath = defaultStevePath;
  const fileBuffer = fs.readFileSync(defaultStevePath);
  const skinDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`;
  settings.skinDataUrl = skinDataUrl;
  settings.skinName = 'Стив';
  settings.skinModel = 'default';
  saveSettings(settings);

  return {
    success: true,
    skinPath: defaultStevePath,
    skinDataUrl,
    skinName: 'Стив',
    skinModel: 'default',
    isDefaultSteve: true
  };
});

ipcMain.handle('get-wardrobe', () => {
  const settings = loadSettings();
  return settings.wardrobe || [];
});

ipcMain.handle('add-to-wardrobe', async (_, customName) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите файл скина (.png)',
    filters: [{ name: 'PNG Images', extensions: ['png'] }],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const selectedPath = result.filePaths[0];
  const skinId = `skin-${Date.now()}`;
  const destSkin = path.join(SKINS_DIR, `${skinId}.png`);
  fs.copyFileSync(selectedPath, destSkin);

  const fileBuffer = fs.readFileSync(destSkin);
  const skinDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`;
  const name = customName || path.basename(selectedPath, '.png');

  const settings = loadSettings();
  if (!settings.wardrobe) settings.wardrobe = [];
  const entry = { id: skinId, name, dataUrl: skinDataUrl, path: destSkin, model: 'default' };
  settings.wardrobe.push(entry);

  settings.skinPath = destSkin;
  settings.skinDataUrl = skinDataUrl;
  settings.skinName = name;
  saveSettings(settings);

  return { success: true, skin: entry, wardrobe: settings.wardrobe };
});

ipcMain.handle('delete-from-wardrobe', (_, skinId) => {
  const settings = loadSettings();
  if (settings.wardrobe) {
    settings.wardrobe = settings.wardrobe.filter(s => s.id !== skinId);
    saveSettings(settings);
  }
  return { success: true, wardrobe: settings.wardrobe || [] };
});

ipcMain.handle('set-active-wardrobe-skin', (_, skinId) => {
  const settings = loadSettings();
  const found = (settings.wardrobe || []).find(s => s.id === skinId);
  if (found) {
    settings.skinPath = found.path;
    settings.skinDataUrl = found.dataUrl;
    settings.skinName = found.name;
    settings.skinModel = found.model || 'default';
    saveSettings(settings);
    return { success: true, skin: found };
  }
  return { success: false };
});

ipcMain.handle('fetch-skin-by-name', async (_, username) => {
  const cleanUser = (username || '').trim();
  if (!cleanUser) return { success: false, error: 'Имя не указано' };

  // 1. Ely.by open skin API
  try {
    const elyUrl = `https://skin.ely.by/skins/${encodeURIComponent(cleanUser)}.png`;
    const elyRes = await fetch(elyUrl);
    if (elyRes.ok) {
      const buffer = Buffer.from(await elyRes.arrayBuffer());
      if (buffer.length > 200) {
        const skinId = `ely-${cleanUser}-${Date.now()}`;
        const destPath = path.join(SKINS_DIR, `${skinId}.png`);
        fs.writeFileSync(destPath, buffer);
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

        const settings = loadSettings();
        if (!settings.wardrobe) settings.wardrobe = [];
        const entry = { id: skinId, name: `${cleanUser} (Ely.by)`, dataUrl, path: destPath, model: 'default' };
        settings.wardrobe.push(entry);
        settings.skinPath = destPath;
        settings.skinDataUrl = dataUrl;
        settings.skinName = entry.name;
        saveSettings(settings);

        return { success: true, source: 'Ely.by', skin: entry, wardrobe: settings.wardrobe };
      }
    }
  } catch (err) {
    console.warn('Ely.by note:', err.message);
  }

  // 2. Mojang official API
  try {
    const mojangProfileRes = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(cleanUser)}`);
    if (mojangProfileRes.ok) {
      const profileData = await mojangProfileRes.json();
      const sessionRes = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${profileData.id}`);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const prop = sessionData.properties?.find(p => p.name === 'textures');
        if (prop) {
          const texturesData = JSON.parse(Buffer.from(prop.value, 'base64').toString('utf8'));
          const skinUrl = texturesData.textures?.SKIN?.url;
          if (skinUrl) {
            const skinImgRes = await fetch(skinUrl);
            if (skinImgRes.ok) {
              const buffer = Buffer.from(await skinImgRes.arrayBuffer());
              const skinId = `mojang-${cleanUser}-${Date.now()}`;
              const destPath = path.join(SKINS_DIR, `${skinId}.png`);
              fs.writeFileSync(destPath, buffer);
              const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

              const settings = loadSettings();
              if (!settings.wardrobe) settings.wardrobe = [];
              const entry = { id: skinId, name: `${cleanUser} (Mojang)`, dataUrl, path: destPath, model: texturesData.textures?.SKIN?.metadata?.model || 'default' };
              settings.wardrobe.push(entry);
              settings.skinPath = destPath;
              settings.skinDataUrl = dataUrl;
              settings.skinName = entry.name;
              saveSettings(settings);

              return { success: true, source: 'Mojang', skin: entry, wardrobe: settings.wardrobe };
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Mojang note:', err.message);
  }

  return { success: false, error: `Скин для игрока «${cleanUser}» не найден ни на Ely.by, ни в Mojang.` };
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

// Scan Real Mods in ~/.zenith-launcher/mods/
ipcMain.handle('scan-mods', async () => {
  if (!fs.existsSync(MODS_DIR)) return [];
  try {
    const files = fs.readdirSync(MODS_DIR);
    return files
      .filter(f => f.endsWith('.hmod') || f.endsWith('.hpack') || f.endsWith('.zip'))
      .map(f => {
        const fullPath = path.join(MODS_DIR, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          path: fullPath,
          size: stat.size,
          sizeFormatted: `${(stat.size / 1024).toFixed(1)} КБ`,
          updatedAt: stat.mtime.toLocaleDateString(),
        };
      });
  } catch (err) {
    console.error('Error scanning mods:', err);
    return [];
  }
});

// Real Saved Servers Manager
ipcMain.handle('get-saved-servers', () => {
  const settings = loadSettings();
  return settings.savedServers || [
    { id: 'srv-local', name: 'Локальный сервер Horizon', address: '127.0.0.1:25565' }
  ];
});

ipcMain.handle('save-servers', (_, servers) => {
  const settings = loadSettings();
  settings.savedServers = servers;
  saveSettings(settings);
  return { success: true };
});

// --- PERSISTENT MOBILE TOUCH CONTROLS & FRIENDS SYSTEM ---
const DEFAULT_TOUCH_SETTINGS = {
  enabled: true,
  stick_mode: 'floating',
  sneak_double_tap: true,
  sprint_hold_forward: true,
  button_scale: 1.0,
  opacity: 0.8,
  touch_camera_sensitivity: 1.0,
  left_handed: false,
  hold_mine_ms: 350,
  sound_feedback: true,
  split_controls: true,
  haptic_feedback: true
};

function loadTouchSettings() {
  try {
    if (fs.existsSync(TOUCH_SETTINGS_FILE)) {
      return { ...DEFAULT_TOUCH_SETTINGS, ...JSON.parse(fs.readFileSync(TOUCH_SETTINGS_FILE, 'utf-8')) };
    }
  } catch (_) {}
  return { ...DEFAULT_TOUCH_SETTINGS };
}

function saveTouchSettings(settings) {
  try {
    if (!fs.existsSync(MOD_DATA_DIR)) fs.mkdirSync(MOD_DATA_DIR, { recursive: true });
    fs.writeFileSync(TOUCH_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing touch settings:', err);
    return false;
  }
}

const DEFAULT_FRIENDS = [
  { id: 'f_alex', nickname: 'Alex_Pro', status: 'online', activity: 'В игре 26.3 • Выживание', ping: 24, worldCode: 'hzn://7b9f-44a1' },
  { id: 'f_steve', nickname: 'CraftMaster', status: 'lobby', activity: 'В главном меню', ping: 38, worldCode: null },
  { id: 'f_notch', nickname: 'Miner2026', status: 'offline', activity: 'Был 2 ч. назад', ping: 0, worldCode: null }
];

function loadFriends() {
  try {
    if (fs.existsSync(FRIENDS_FILE)) {
      return JSON.parse(fs.readFileSync(FRIENDS_FILE, 'utf-8'));
    }
  } catch (_) {}
  return DEFAULT_FRIENDS;
}

function saveFriends(friends) {
  try {
    fs.writeFileSync(FRIENDS_FILE, JSON.stringify(friends, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing friends:', err);
    return false;
  }
}

ipcMain.handle('get-touch-settings', () => loadTouchSettings());
ipcMain.handle('save-touch-settings', (_, settings) => saveTouchSettings(settings));

ipcMain.handle('export-android-apk', async () => {
  const { execSync } = require('child_process');
  try {
    const homeDir = process.env.HOME || USER_DATA;
    const hmodSrc = path.join(MODS_DIR, 'mobile_touch_controls.hmod');
    const hmodDist = path.join(homeDir, 'horizon/horizon-main/android/assets/mods/mobile_touch_controls.hmod');
    if (fs.existsSync(hmodSrc)) {
      const hmodDistDir = path.dirname(hmodDist);
      if (!fs.existsSync(hmodDistDir)) fs.mkdirSync(hmodDistDir, { recursive: true });
      fs.copyFileSync(hmodSrc, hmodDist);
    }

    execSync('/home/roman/horizon/horizon-main/android/package-apk.sh', { stdio: 'pipe' });
    const apkSrc = path.join(homeDir, 'horizon/horizon-main/android/dist/horizon-mobile-26.3.apk');
    const apkDst = path.join(homeDir, 'Downloads/horizon-mobile-26.3.apk');
    if (fs.existsSync(apkSrc)) {
      fs.copyFileSync(apkSrc, apkDst);
    }

    let adbDevice = null;
    try {
      const adbOut = execSync('/home/roman/Android/Sdk/platform-tools/adb devices', { encoding: 'utf-8' });
      const lines = adbOut.trim().split('\n').slice(1).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const [id, status] = line.split(/\s+/);
        if (status === 'device') {
          adbDevice = id;
          break;
        }
      }
    } catch (_) {}

    return { success: true, path: apkDst, adbDevice };
  } catch (err) {
    console.error('Failed exporting APK:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('install-adb-apk', async () => {
  const { execSync } = require('child_process');
  try {
    const homeDir = process.env.HOME || USER_DATA;
    const apk = path.join(homeDir, 'Downloads/horizon-mobile-26.3.apk');
    const out = execSync(`/home/roman/Android/Sdk/platform-tools/adb install -r "${apk}"`, { encoding: 'utf-8' });
    return { success: true, output: out };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-friends', () => loadFriends());
ipcMain.handle('save-friends', (_, friends) => saveFriends(friends));
ipcMain.handle('generate-invite-code', () => {
  const hex = () => Math.random().toString(16).substring(2, 6);
  return `hzn://${hex()}-${hex()}`;
});

// Automatically download or link official Minecraft assets directly from Mojang CDN
async function ensureMinecraftAssets(onProgress) {
  const checkFile = path.join(RESOURCES_DIR, 'horizon-resources.json');
  const checkAssets = path.join(RESOURCES_DIR, 'assets', 'minecraft');
  if (fs.existsSync(checkFile) && fs.existsSync(checkAssets)) {
    return RESOURCES_DIR;
  }

  // 1. Check if user already has an official Minecraft installation locally
  const defaultMcPaths = [
    path.join(os.homedir(), '.minecraft'),
    path.join(process.env.APPDATA || '', '.minecraft'),
    path.join(os.homedir(), 'Library/Application Support/minecraft'),
  ];

  for (const mcPath of defaultMcPaths) {
    const mcAssets = path.join(mcPath, 'assets');
    if (fs.existsSync(mcAssets) && fs.existsSync(path.join(mcAssets, 'objects'))) {
      onProgress?.('Импорт официальных ассетов из .minecraft...');
      try {
        if (!fs.existsSync(path.join(RESOURCES_DIR, 'assets'))) {
          fs.cpSync(mcAssets, path.join(RESOURCES_DIR, 'assets'), { recursive: true });
        }
      } catch (err) {
        console.warn('Could not copy from .minecraft:', err);
      }
    }
  }

  // 2. Download official Minecraft assets directly from Mojang CDN if missing
  if (!fs.existsSync(checkAssets)) {
    onProgress?.('Загрузка официальных ассетов с серверов Minecraft (Mojang)...');
    
    // Official Mojang client.jar URL for 26.3
    const mojangClientJarUrl = 'https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar';
    const tempJar = path.join(RESOURCES_DIR, 'client-mojang-temp.jar');
    
    try {
      const jarRes = await fetch(mojangClientJarUrl);
      if (jarRes.ok) {
        const fileStream = fs.createWriteStream(tempJar);
        for await (const chunk of jarRes.body) {
          fileStream.write(chunk);
        }
        await new Promise((res, rej) => fileStream.end(err => err ? rej(err) : res()));

        onProgress?.('Распаковка официальных текстур и моделей Minecraft...');
        await new Promise((resolve) => {
          if (process.platform === 'win32') {
            execFile('tar', ['-xf', tempJar, 'assets', '-C', RESOURCES_DIR], () => resolve());
          } else {
            execFile('unzip', ['-o', tempJar, 'assets/*', '-d', RESOURCES_DIR], () => resolve());
          }
        });
        try { fs.unlinkSync(tempJar); } catch (_) {}
      }
    } catch (e) {
      console.warn('Mojang official download note:', e.message);
    }

    // Official Mojang asset-index 34.json
    try {
      const indexRes = await fetch('https://piston-meta.mojang.com/v1/packages/e787e8afd149a4cefa89d341b91f5aed8f5d93a0/34.json');
      if (indexRes.ok) {
        const indexData = await indexRes.text();
        fs.writeFileSync(path.join(RESOURCES_DIR, 'asset-index.json'), indexData);
      }
    } catch (_) {}
  }

  return RESOURCES_DIR;
}

// On-demand version download from GitHub releases
ipcMain.handle('download-version', async (_, versionTag) => {
  const releases = await fetchOnlineReleases();
  const release = releases.find(r => r.tag === versionTag) || { tag: versionTag, assets: [] };
  
  const targetAssetName = process.platform === 'win32'
    ? 'horizon-windows-x64.zip'
    : (process.platform === 'darwin' ? 'horizon-macos-arm64.zip' : 'horizon-linux-x86_64.tar.gz');

  const asset = release.assets?.find(a => a.name === targetAssetName);
  const downloadUrl = asset?.downloadUrl || `https://github.com/horizon-rust/horizon/releases/download/${versionTag}/${targetAssetName}`;

  const destDir = path.join(VERSIONS_DIR, versionTag);
  const archivePath = path.join(VERSIONS_DIR, `${versionTag}-${targetAssetName}`);

  try {
    mainWindow?.webContents.send('version-download-progress', {
      tag: versionTag,
      percent: 5,
      downloadedBytes: 0,
      totalBytes: asset?.size || 34000000,
      status: `Подключение к серверам GitHub (${targetAssetName})...`
    });

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Zenith-Launcher/1.0 (Linux; x86_64)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`GitHub download failed with status ${response.status}`);
    }

    const totalBytes = parseInt(response.headers.get('content-length') || String(asset?.size || 34000000), 10);
    let downloadedBytes = 0;
    const fileStream = fs.createWriteStream(archivePath);

    for await (const chunk of response.body) {
      downloadedBytes += chunk.length;
      fileStream.write(chunk);
      const percent = totalBytes > 0 ? Math.min(95, Math.round((downloadedBytes / totalBytes) * 100)) : 50;
      
      mainWindow?.webContents.send('version-download-progress', {
        tag: versionTag,
        percent,
        downloadedBytes,
        totalBytes,
        status: `Загрузка: ${Math.round(downloadedBytes / (1024 * 1024))} МБ / ${Math.round(totalBytes / (1024 * 1024))} МБ`
      });
    }

    await new Promise((res, rej) => {
      fileStream.end((err) => err ? rej(err) : res());
    });

    mainWindow?.webContents.send('version-download-progress', {
      tag: versionTag,
      percent: 96,
      downloadedBytes: totalBytes,
      totalBytes,
      status: 'Распаковка нативного архива движка...'
    });

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    // Extract archive
    if (targetAssetName.endsWith('.tar.gz')) {
      await new Promise((resolve, reject) => {
        execFile('tar', ['-xzf', archivePath, '--strip-components=1', '-C', destDir], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } else {
      // Unzip: support Windows native tar, PowerShell Expand-Archive, or unzip
      await new Promise((resolve, reject) => {
        if (process.platform === 'win32') {
          execFile('tar', ['-xf', archivePath, '-C', destDir], (err) => {
            if (!err) return resolve();
            execFile('powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath "${archivePath}" -DestinationPath "${destDir}" -Force`], (psErr) => {
              if (psErr) return reject(psErr);
              resolve();
            });
          });
        } else {
          execFile('unzip', ['-o', archivePath, '-d', destDir], (err) => {
            if (err) return reject(err);
            resolve();
          });
        }
      });
    }

    // Normalize nested directory if archive extracted into a subfolder
    try {
      const entries = fs.readdirSync(destDir);
      if (entries.length === 1) {
        const singleSub = path.join(destDir, entries[0]);
        if (fs.statSync(singleSub).isDirectory()) {
          for (const item of fs.readdirSync(singleSub)) {
            const src = path.join(singleSub, item);
            const dst = path.join(destDir, item);
            if (!fs.existsSync(dst)) {
              fs.renameSync(src, dst);
            }
          }
          try { fs.rmdirSync(singleSub); } catch (_) {}
        }
      }
    } catch (_) {}

    // Set executable bit
    const binaryName = process.platform === 'win32' ? 'horizon-client.exe' : 'horizon-client';
    const binary = path.join(destDir, binaryName);
    if (fs.existsSync(binary) && process.platform !== 'win32') {
      fs.chmodSync(binary, 0o755);
    }

    // Ensure official Minecraft assets are downloaded directly from Mojang CDN
    await ensureMinecraftAssets((status) => {
      mainWindow?.webContents.send('version-download-progress', {
        tag: versionTag,
        percent: 98,
        downloadedBytes: totalBytes,
        totalBytes,
        status,
      });
    });

    // Ensure resources are linked or copied into the version folder
    const verRes = path.join(destDir, 'resources');
    if (!fs.existsSync(verRes)) {
      const sharedRes = findResourcesDir(versionTag);
      if (sharedRes && sharedRes !== verRes) {
        try {
          fs.symlinkSync(sharedRes, verRes, 'junction');
        } catch (_) {
          try { fs.cpSync(sharedRes, verRes, { recursive: true }); } catch (__) {}
        }
      }
    }

    // Clean up archive file
    try { fs.unlinkSync(archivePath); } catch (_) {}

    mainWindow?.webContents.send('version-download-progress', {
      tag: versionTag,
      percent: 100,
      downloadedBytes: totalBytes,
      totalBytes,
      status: 'Установка завершена!'
    });

    return { success: true, tag: versionTag };
  } catch (err) {
    try { if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath); } catch (_) {}
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-status', () => {
  const settings = loadSettings();
  const binary = findHorizonBinary(settings.selectedVersion);
  const resources = findResourcesDir(settings.selectedVersion);
  return {
    isReady: Boolean(binary && resources),
    binaryPath: binary,
    resourcesPath: resources,
    isGameRunning: Boolean(gameProcess && !gameProcess.killed),
    currentVersion: settings.selectedVersion || 'v0.2.93',
  };
});

ipcMain.handle('launch-game', async (_, targetServer) => {
  if (gameProcess && !gameProcess.killed) {
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
    args.push('--width', String(settings.width || 1280), '--height', String(settings.height || 720));
  }

  // Attach active WASM mods
  if (Array.isArray(settings.activeMods)) {
    for (const modKey of settings.activeMods) {
      const modPath = getModFile(modKey);
      if (modPath) {
        args.push('--dev-mod', modPath);
      }
    }
  }

  if (settings.skinPath && fs.existsSync(settings.skinPath)) {
    args.push('--skin', settings.skinPath);
  }

  if (settings.customArgs && typeof settings.customArgs === 'string') {
    const extra = settings.customArgs.trim().split(/\s+/).filter(Boolean);
    args.push(...extra);
  }

  try {
    const cwd = GAME_DIR;
    const env = {
      ...process.env,
      ...(settings.preferDiscreteGpu ? {
        DRI_PRIME: '1',
        __NV_PRIME_RENDER_OFFLOAD: '1',
        __GLX_VENDOR_LIBRARY_NAME: 'nvidia',
      } : {})
    };

    gameProcess = spawn(binary, args, {
      cwd,
      env,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    gameProcess.stdout.on('data', (data) => {
      mainWindow?.webContents.send('game-log', data.toString());
    });

    gameProcess.stderr.on('data', (data) => {
      mainWindow?.webContents.send('game-log', data.toString());
    });

    gameProcess.on('exit', (code) => {
      gameProcess = null;
      mainWindow?.webContents.send('game-exit', code);
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('kill-game', () => {
  if (gameProcess && !gameProcess.killed) {
    gameProcess.kill('SIGTERM');
    gameProcess = null;
    return true;
  }
  return false;
});

// Window controls
ipcMain.on('window-min', () => mainWindow?.minimize());
ipcMain.on('window-max', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());
