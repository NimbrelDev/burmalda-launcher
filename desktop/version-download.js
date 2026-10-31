// On-demand game version download from GitHub Releases with progress events
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { VERSIONS_DIR } from './paths.js';
import { appState } from './state.js';
import { fetchOnlineReleases } from './releases.js';
import { findResourcesDir } from './game-files.js';
import { ensureMinecraftAssets } from './minecraft-assets.js';
import { prepareHorizonResources } from './horizon-prepare.js';

export function registerVersionDownloadHandler() {
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
      appState.mainWindow?.webContents.send('version-download-progress', {
        tag: versionTag,
        percent: 5,
        downloadedBytes: 0,
        totalBytes: asset?.size || 34000000,
        status: `Подключение к серверам GitHub (${targetAssetName})...`
      });

      const response = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Burmalda-Launcher/1.0 (Linux; x86_64)',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`GitHub download failed with status ${response.status}`);
      }

      const totalBytes = parseInt(response.headers.get('content-length') || String(asset?.size || 34000000), 10);
      let downloadedBytes = 0;
      const fileStream = fs.createWriteStream(archivePath);

      // Overall progress map (byte-accurate where possible):
      //   0-12   engine archive from GitHub
      //   12-14  extraction
      //   14-18  shared Mojang assets (ensureMinecraftAssets)
      //   18-97  pinned resources: jars + libraries + assets (byte-accurate) then horizon-prepare
      //   97-100 finishing up
      const sendProgress = (percent, status) => {
        appState.mainWindow?.webContents.send('version-download-progress', {
          tag: versionTag,
          percent,
          downloadedBytes,
          totalBytes,
          status,
        });
      };

      for await (const chunk of response.body) {
        downloadedBytes += chunk.length;
        fileStream.write(chunk);
        const percent = totalBytes > 0 ? Math.min(12, Math.round((downloadedBytes / totalBytes) * 12)) : 6;

        sendProgress(percent, `Загрузка движка: ${Math.round(downloadedBytes / (1024 * 1024))} МБ / ${Math.round(totalBytes / (1024 * 1024))} МБ`);
      }

      await new Promise((res, rej) => {
        fileStream.end((err) => err ? rej(err) : res());
      });

      sendProgress(12, 'Распаковка нативного архива движка...');

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

      // Ensure official Minecraft assets are downloaded directly from Mojang CDN for supported version
      const targetMcVersion = release.defaultMcVersion || (release.supportedMcVersions && release.supportedMcVersions[0]) || '26.3';
      await ensureMinecraftAssets(targetMcVersion, (status) => {
        sendProgress(16, status);
      });

      // Prepare the engine's pinned resources via its own horizon-prepare
      // (official Mojang client/server jars + libraries + assets, then data export).
      // Download bytes are cumulative, mapped onto the 18-97 range.
      try {
        await prepareHorizonResources(destDir, targetMcVersion, ({ status, bytesDone, bytesTotal }) => {
          const percent = bytesTotal > 0
            ? Math.min(96, 18 + Math.round((bytesDone / bytesTotal) * 78))
            : 97;
          sendProgress(percent, status || 'Подготовка ресурсов...');
        });
      } catch (prepErr) {
        console.warn('horizon-prepare note:', prepErr.message);
      }

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

      appState.mainWindow?.webContents.send('version-download-progress', {
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
}
