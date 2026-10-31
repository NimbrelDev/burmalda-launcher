// Locating installed game binaries, resources and addon files
import path from 'path';
import fs from 'fs';
import { VERSIONS_DIR, RESOURCES_DIR, MODS_DIR } from './paths.js';
import { loadSettings } from './settings.js';

// Check if a specific version tag is installed (versioned dir OR bundled fallback)
function isVersionInstalled(tag) {
  if (!tag) return false;
  const vDir = path.join(VERSIONS_DIR, tag);
  const binaryName = process.platform === 'win32' ? 'horizon-client.exe' : 'horizon-client';
  return fs.existsSync(path.join(vDir, binaryName)) ||
         fs.existsSync(path.join(vDir, 'horizon-windows-x64', binaryName)) ||
         fs.existsSync(path.join(vDir, 'horizon-linux-x86_64', binaryName)) ||
         fs.existsSync('/home/roman/horizon-dist/game-bundle-linux/horizon-client');
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
    // Fallback: local dev build
    '/home/roman/horizon-dist/game-bundle-linux/horizon-client',
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
  if (!modKey || typeof modKey !== 'string') return null;

  if (path.isAbsolute(modKey) && fs.existsSync(modKey)) {
    return modKey;
  }

  const mapping = {
    'coords-hud': 'coords_hud-0.1.0.hmod',
    'coords_hud': 'coords_hud-0.1.0.hmod',
    'zoom': 'zoom-0.1.0.hmod',
    'fps-overlay': 'fps_overlay-0.1.0.hmod',
    'fps_overlay': 'fps_overlay-0.1.0.hmod',
    'keystrokes': 'keystrokes-0.1.0.hmod',
    'recipes': 'cozy-1.0.0.hpack',
    'cozy': 'cozy-1.0.0.hpack',
    'faithful': 'faithful_clean-1.0.0.hpack',
    'faithful_clean': 'faithful_clean-1.0.0.hpack',
    'glow': 'glow-1.0.0.hshader',
    'cinematic-sun': 'cinematic_sun-1.0.0.hshader',
    'cinematic_sun': 'cinematic_sun-1.0.0.hshader'
  };

  const base = path.basename(modKey);
  const candidateNames = [
    mapping[modKey],
    mapping[base],
    modKey,
    base,
    `${modKey}.hmod`,
    `${modKey}.hpack`,
    `${modKey}.hshader`
  ].filter(Boolean);

  const searchDirs = [
    MODS_DIR,
    '/home/roman/horizon-dist/website/api/mods/files',
    '/home/roman/horizon/horizon-main/crates/horizon-mods/tests/index',
  ];

  for (const dir of searchDirs) {
    for (const name of candidateNames) {
      const full = path.join(dir, name);
      if (fs.existsSync(full)) return full;
    }
  }
  return null;
}

export { isVersionInstalled, findHorizonBinary, findResourcesDir, getModFile };
