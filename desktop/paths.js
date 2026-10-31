// Central storage paths for the launcher (~/.zenith-launcher and bundled assets)
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, '..', 'src');
const ANDROID_DIR = path.join(__dirname, '..', 'android');
const DIST_DIR = path.join(__dirname, '..', 'dist');

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

export {
  __dirname,
  SRC_DIR,
  ANDROID_DIR,
  DIST_DIR,
  USER_DATA,
  GAME_DIR,
  SETTINGS_FILE,
  VERSIONS_DIR,
  SAVES_DIR,
  MODS_DIR,
  SKINS_DIR,
  RESOURCES_DIR,
  RELEASES_CACHE_FILE,
  FRIENDS_FILE,
  MOD_DATA_DIR,
  TOUCH_SETTINGS_FILE,
};
