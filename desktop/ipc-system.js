// System IPC handlers: mobile touch controls, friends & invite codes,
// Android APK export/adb install
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { ANDROID_DIR, DIST_DIR, USER_DATA, MOD_DATA_DIR, TOUCH_SETTINGS_FILE } from './paths.js';

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


export function registerSystemHandlers() {
  ipcMain.handle('get-touch-settings', () => loadTouchSettings());
  ipcMain.handle('save-touch-settings', (_, settings) => saveTouchSettings(settings));

// Resolve adb binary: PATH first, then the Android SDK location.
function resolveAdb(execSync) {
  try {
    execSync('command -v adb', { stdio: 'pipe' });
    return 'adb';
  } catch (_) {}
  const candidates = [
    process.env.ANDROID_SDK_ROOT && path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools', 'adb'),
    process.env.ANDROID_HOME && path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb'),
    path.join(process.env.HOME || '', 'Android', 'Sdk', 'platform-tools', 'adb')
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'adb';
}

  ipcMain.handle('export-android-apk', async () => {
    const { execSync } = require('child_process');
    try {
      const homeDir = process.env.HOME || USER_DATA;
      const packageScript = path.join(ANDROID_DIR, 'package-apk.sh');

      // Run clean standalone Android APK packaging script
      execSync(`bash "${packageScript}"`, { stdio: 'pipe' });

      const apkDist = path.join(DIST_DIR, 'android', 'horizon-mobile-26.3.apk');
      const apkDownloads = path.join(homeDir, 'Downloads', 'horizon-mobile-26.3.apk');

      const adb = resolveAdb(execSync);
      let adbDevice = null;
      try {
        const adbOut = execSync(`"${adb}" devices`, { encoding: 'utf-8' });
        const lines = adbOut.trim().split('\n').slice(1).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const [id, status] = line.split(/\s+/);
          if (status === 'device') {
            adbDevice = id;
            break;
          }
        }
      } catch (_) {}

      return { success: true, path: fs.existsSync(apkDist) ? apkDist : apkDownloads, adbDevice };
    } catch (err) {
      console.error('Failed exporting APK:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('install-adb-apk', async () => {
    const { execSync } = require('child_process');
    try {
      const homeDir = process.env.HOME || USER_DATA;
      let apk = path.join(DIST_DIR, 'android', 'horizon-mobile-26.3.apk');
      if (!fs.existsSync(apk)) {
        apk = path.join(homeDir, 'Downloads', 'horizon-mobile-26.3.apk');
      }
      const adb = resolveAdb(execSync);
      const out = execSync(`"${adb}" install -r "${apk}"`, { encoding: 'utf-8' });
      return { success: true, output: out };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('generate-invite-code', () => {
    const hex = () => Math.random().toString(16).substring(2, 6);
    return `hzn://${hex()}-${hex()}`;
  });
}
