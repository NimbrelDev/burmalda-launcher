// Mods / addons / saved servers IPC handlers
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { MODS_DIR } from './paths.js';
import { loadSettings, saveSettings } from './settings.js';

export function registerModHandlers() {
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

  // Import custom mod/pack/shader file directly from PC to ~/.zenith-launcher/mods/
  ipcMain.handle('import-mod-file', async (_, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) {
      return { success: false, error: 'Файл не найден' };
    }
    try {
      if (!fs.existsSync(MODS_DIR)) fs.mkdirSync(MODS_DIR, { recursive: true });
      const filename = path.basename(filePath);
      const destPath = path.join(MODS_DIR, filename);
      fs.copyFileSync(filePath, destPath);
      const stat = fs.statSync(destPath);
      return {
        success: true,
        filename,
        fullPath: destPath,
        size: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} КБ`
      };
    } catch (err) {
      console.error('Failed importing mod file:', err);
      return { success: false, error: err.message };
    }
  });

  // Bundled catalog of certified Horizon addons available out-of-the-box
  ipcMain.handle('get-bundled-catalog', () => {
    return [
      {
        id: 'keystrokes',
        name: 'Keystrokes HUD',
        filename: 'keystrokes-0.1.0.hmod',
        category: 'mods',
        ext: '.hmod',
        desc: 'Отображение нажатий клавиш WASD, пробела и кликов мыши на экране в реальном времени.',
        author: 'Horizon Team',
        tags: ['HUD', 'PvP']
      },
      {
        id: 'fps_overlay',
        name: 'FPS & Mem Monitor',
        filename: 'fps_overlay-0.1.0.hmod',
        category: 'mods',
        ext: '.hmod',
        desc: 'Компактный счетчик частоты кадров (FPS), используемой памяти и задержки кадра.',
        author: 'Horizon Team',
        tags: ['Оптимизация', 'FPS']
      },
      {
        id: 'zoom',
        name: 'Camera Zoom (Клавиша C)',
        filename: 'zoom-0.1.0.hmod',
        category: 'mods',
        ext: '.hmod',
        desc: 'Плавное оптическое приближение камеры без потери качества обзора.',
        author: 'Horizon Team',
        tags: ['Утилиты', 'Обзор']
      },
      {
        id: 'coords_hud',
        name: 'Coordinates & Biome HUD',
        filename: 'coords_hud-0.1.0.hmod',
        category: 'mods',
        ext: '.hmod',
        desc: 'Удобное отображение координат игрока X, Y, Z, направления взгляда и текущего биома.',
        author: 'Horizon Team',
        tags: ['Интерфейс', 'HUD']
      },
      {
        id: 'faithful_clean',
        name: 'Faithful 32x Clean',
        filename: 'faithful_clean-1.0.0.hpack',
        category: 'textures',
        ext: '.hpack',
        desc: 'Оригинальные текстуры Minecraft в двойном разрешении 32x с кристальной четкостью.',
        author: 'VoxelCraft',
        tags: ['32x', 'HD Текстуры']
      },
      {
        id: 'cozy_ui',
        name: 'Cozy Recipes & UI',
        filename: 'cozy-1.0.0.hpack',
        category: 'textures',
        ext: '.hpack',
        desc: 'Приятная темная тема инвентаря, быстрое дерево крафтов и сглаженные иконки.',
        author: 'Horizon UI',
        tags: ['UI', 'Текстуры']
      },
      {
        id: 'cinematic_sun',
        name: 'Cinematic Sun Rays',
        filename: 'cinematic_sun-1.0.0.hshader',
        category: 'shaders',
        ext: '.hshader',
        desc: 'Динамические объемные лучи солнца (Godrays), рассеянный свет и мягкие тени на рассвете/закате.',
        author: 'RustShaders',
        tags: ['Шейдеры', 'Освещение']
      },
      {
        id: 'glow',
        name: 'Soft Glow Shaders',
        filename: 'glow-1.0.0.hshader',
        category: 'shaders',
        ext: '.hshader',
        desc: 'Мягкое кинематографичное свечение факелов, лавы, костров и светящегося камня.',
        author: 'RustShaders',
        tags: ['Шейдеры', 'Атмосфера']
      }
    ];
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
}
