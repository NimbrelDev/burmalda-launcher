// Launcher settings persistence (settings.json in ~/.burmalda-launcher)
import fs from 'fs';
import { SETTINGS_FILE } from './paths.js';
import { appState } from './state.js';

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
        mods: [],
        texturepacks: [],
        shaders: []
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
      if (!data.modpacks || !Array.isArray(data.modpacks) || data.modpacks.length === 0) {
        data.modpacks = defaults.modpacks;
      } else {
        // Keep ONLY 'vanilla' and user-created custom packs
        const cleanPacks = data.modpacks.filter(p => p.id === 'vanilla' || (!p.isDefault && p.id !== 'pvp-boost' && p.id !== 'pvp-fps' && p.id !== 'ultra-graphics'));
        if (!cleanPacks.some(p => p.id === 'vanilla')) {
          cleanPacks.unshift(defaults.modpacks[0]);
        }
        data.modpacks = cleanPacks;
      }
      if (!data.activeModpackId || (data.activeModpackId !== 'vanilla' && !data.modpacks.some(p => p.id === data.activeModpackId))) {
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
    if (appState.mainWindow && settings.brandName) {
      appState.mainWindow.setTitle(settings.brandName);
    }
    return true;
  } catch (err) {
    console.error('Failed writing settings:', err);
    return false;
  }
}

export { loadSettings, saveSettings };
