// Official Minecraft assets: dynamic Mojang manifest lookup and CDN download
import os from 'os';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { RESOURCES_DIR } from './paths.js';

// Dynamically query Mojang official version manifest for ANY Minecraft version!
async function getMojangVersionMetadata(mcVersion) {
  const fallback263 = {
    clientUrl: 'https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar',
    assetIndexUrl: 'https://piston-meta.mojang.com/v1/packages/e787e8afd149a4cefa89d341b91f5aed8f5d93a0/34.json',
  };

  try {
    const res = await fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json', {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Burmalda-Launcher/1.0' }
    });
    if (res.ok) {
      const manifest = await res.json();
      const entry = (manifest.versions || []).find(v => v.id === mcVersion || v.id.startsWith(mcVersion));
      if (entry && entry.url) {
        const pkgRes = await fetch(entry.url, {
          signal: AbortSignal.timeout(6000),
          headers: { 'User-Agent': 'Burmalda-Launcher/1.0' }
        });
        if (pkgRes.ok) {
          const pkg = await pkgRes.json();
          return {
            clientUrl: pkg.downloads?.client?.url || fallback263.clientUrl,
            assetIndexUrl: pkg.assetIndex?.url || fallback263.assetIndexUrl,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Mojang manifest dynamic lookup error, using fallback:', err.message);
  }

  return fallback263;
}

// Automatically download or link official Minecraft assets directly from Mojang CDN
async function ensureMinecraftAssets(mcVersion = '26.3', onProgress) {
  const checkFile = path.join(RESOURCES_DIR, 'horizon-resources.json');
  const checkAssets = path.join(RESOURCES_DIR, 'assets', 'minecraft');
  if (fs.existsSync(checkFile) && fs.existsSync(checkAssets)) {
    try {
      const existing = JSON.parse(fs.readFileSync(checkFile, 'utf-8'));
      if (existing.mcVersion === mcVersion) {
        return RESOURCES_DIR;
      }
    } catch (_) {}
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

  // 2. Download official Minecraft assets directly from Mojang CDN dynamically for mcVersion
  if (!fs.existsSync(checkAssets)) {
    onProgress?.(`Загрузка официальных ассетов Minecraft ${mcVersion} с серверов Mojang...`);
    
    const meta = await getMojangVersionMetadata(mcVersion);
    const mojangClientJarUrl = meta.clientUrl;
    const tempJar = path.join(RESOURCES_DIR, `client-${mcVersion}-temp.jar`);
    
    try {
      const jarRes = await fetch(mojangClientJarUrl);
      if (jarRes.ok) {
        const fileStream = fs.createWriteStream(tempJar);
        for await (const chunk of jarRes.body) {
          fileStream.write(chunk);
        }
        await new Promise((res, rej) => fileStream.end(err => err ? rej(err) : res()));

        onProgress?.(`Распаковка официальных текстур и моделей Minecraft ${mcVersion}...`);
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

    // Official Mojang asset index
    try {
      const indexRes = await fetch(meta.assetIndexUrl);
      if (indexRes.ok) {
        const indexData = await indexRes.text();
        fs.writeFileSync(path.join(RESOURCES_DIR, 'asset-index.json'), indexData);
      }
    } catch (_) {}
  }

  try {
    fs.writeFileSync(checkFile, JSON.stringify({ mcVersion, preparedAt: new Date().toISOString() }, null, 2));
  } catch (_) {}

  return RESOURCES_DIR;
}

export { ensureMinecraftAssets };
