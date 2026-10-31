// Profile IPC handlers: skins, default skins gallery and wardrobe
import { ipcMain, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { SRC_DIR, SKINS_DIR } from './paths.js';
import { appState } from './state.js';
import { loadSettings, saveSettings } from './settings.js';

export function registerSkinHandlers() {
  // Profile: Skin selector dialog
  ipcMain.handle('select-skin', async () => {
    const result = await dialog.showOpenDialog(appState.mainWindow, {
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

    const defaultStevePath = path.join(SRC_DIR, 'assets', 'steve.png');

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
    { id: 'burmalda', name: 'Бурмалда', model: 'default', filename: 'burmalda.png' },
    { id: 'burmalda-ember', name: 'Искра', model: 'default', filename: 'burmalda-ember.png' },
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
    const skinsDir = path.join(SRC_DIR, 'assets', 'default_skins');
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
    const skinPath = path.join(SRC_DIR, 'assets', 'default_skins', found.filename);
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
    const defaultStevePath = path.join(SRC_DIR, 'assets', 'steve.png');
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
    const result = await dialog.showOpenDialog(appState.mainWindow, {
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
}
