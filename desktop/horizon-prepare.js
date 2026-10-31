// Horizon pinned-resource preparation: mirrors what the official Horizon flow
// expects. The engine refuses to run until `horizon-prepare` has processed the
// pinned vanilla client/server jars from Mojang's official CDN into
// <versionDir>/.local/horizon-client/<mcVersion>. Everything here downloads
// ONLY from Mojang official hosts (piston-meta / piston-data /
// resources.download.minecraft.net) and is cached per Minecraft version in
// ~/.burmalda-launcher/mojang/<mcVersion>, so a second engine version reuses it.
import { execFile, spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { GAME_DIR } from './paths.js';

const MOJANG_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';

function mojangDirFor(mcVersion) {
  return path.join(GAME_DIR, 'mojang', mcVersion);
}

async function fetchJson(url, timeoutMs = 8000) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': 'Burmalda-Launcher/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// SHA-pinned files must be stored byte-for-byte as served — any reformatting
// (JSON.stringify) changes their sha1 and the engine rejects them.
async function fetchText(url, timeoutMs = 8000) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': 'Burmalda-Launcher/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// --- generic resumable downloader with retries ---
// tasks: [{url, dst, size?, sha1?}]; onProgress(done, count, bytesDone, bytesTotal)
async function downloadFiles(tasks, concurrency, onProgress) {
  const totalBytes = tasks.reduce((s, t) => s + (t.size || 0), 0);
  let done = 0;
  let doneBytes = 0;
  let workerIndex = 0;

  async function worker() {
    while (true) {
      const i = workerIndex++;
      if (i >= tasks.length) return;
      const { url, dst, size, sha1 } = tasks[i];
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = Buffer.from(await res.arrayBuffer());
          if (sha1 && crypto.createHash('sha1').update(buf).digest('hex') !== sha1) {
            throw new Error('sha1 mismatch');
          }
          if (size && buf.length !== size) throw new Error(`size mismatch: got ${buf.length}, want ${size}`);
          fs.writeFileSync(dst, buf);
          break;
        } catch (_) {
          if (attempt === 4) throw new Error(`download failed: ${url}`);
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
      done++;
      doneBytes += size || 0;
      onProgress?.(done, tasks.length, doneBytes, totalBytes);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
}

function mb(n) {
  return `${Math.round(n / (1024 * 1024))} МБ`;
}

// --- Mojang side: build a minimal "official launcher" directory ---
// pins: research-lock.json's `minecraft` section (manifest/client/server sha1 pins).
// Mojang sometimes republishes version jsons; the engine only accepts the pinned
// ones, so when pins exist we fetch the version json straight from its pinned
// sha1 URL (piston-meta serves content-addressed by sha).
// onProgress: ({status, bytesDone, bytesTotal}) with bytes cumulative over all phases
export async function ensureMojangDir(mcVersion, onProgress, pins = null) {
  const dir = mojangDirFor(mcVersion);
  const verDir = path.join(dir, 'versions', mcVersion);
  const jarPath = path.join(verDir, `${mcVersion}.jar`);
  const jsonPath = path.join(verDir, `${mcVersion}.json`);
  const serverPath = path.join(verDir, 'server.jar');
  const indexesDir = path.join(dir, 'assets', 'indexes');

  const acceptedManifestShas = [
    pins?.manifest_sha1,
    ...(pins?.accepted_manifest_sha1 || []),
  ].filter(Boolean);
  const fileSha1 = (f) => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
  const manifestJsonOk = () => fs.existsSync(jsonPath) &&
    (!acceptedManifestShas.length || acceptedManifestShas.includes(fileSha1(jsonPath)));

  if (fs.existsSync(jarPath) && fs.existsSync(serverPath) && manifestJsonOk()) {
    return { dir, jarPath, serverPath };
  }

  fs.mkdirSync(verDir, { recursive: true });
  fs.mkdirSync(indexesDir, { recursive: true });

  onProgress?.({ status: 'Чтение официального манифеста Mojang...' });
  const manifest = await fetchJson(MOJANG_MANIFEST_URL);
  const entry = (manifest.versions || []).find((v) => v.id === mcVersion);
  if (!entry) throw new Error(`Версия ${mcVersion} не найдена в манифесте Mojang`);
  let pkgRaw = await fetchText(entry.url);
  fs.writeFileSync(jsonPath, pkgRaw);
  let pkg = JSON.parse(pkgRaw);

  // Mojang republished the version json — fall back to the engine's pinned copy
  if (!manifestJsonOk()) {
    const pinnedSha = pins?.manifest_sha1;
    if (!pinnedSha) throw new Error('Mojang перепубликовал файл версии, а pin движка не найден (research-lock.json)');
    onProgress?.({ status: 'Mojang обновил файл версии — берём закреплённую движком копию...' });
    pkgRaw = await fetchText(`https://piston-meta.mojang.com/v1/packages/${pinnedSha}/${mcVersion}.json`);
    fs.writeFileSync(jsonPath, pkgRaw);
    if (!manifestJsonOk()) throw new Error('Закреплённый файл версии не скачался корректно');
    pkg = JSON.parse(pkgRaw);
  }

  // Asset index (small) — fetch up front so its object sizes count in the total
  onProgress?.({ status: 'Чтение индекса ассетов Mojang...' });
  let assetIndex = null;
  if (pkg.assetIndex?.url) {
    const idxRaw = await fetchText(pkg.assetIndex.url);
    assetIndex = JSON.parse(idxRaw);
    fs.writeFileSync(path.join(indexesDir, `${pkg.assetIndex.id || mcVersion}.json`), idxRaw);
  }

  const dl = pkg.downloads || {};
  const jarTasks = [];
  // Pins win over the (possibly republished) json: piston-data is
  // content-addressed, so a pinned sha1 is itself a valid download URL.
  const clientSha = pins?.client_sha1 || dl.client?.sha1;
  const serverSha = pins?.server_sha1 || dl.server?.sha1;
  if (clientSha) {
    jarTasks.push({
      url: dl.client?.url && dl.client.sha1 === clientSha ? dl.client.url : `https://piston-data.mojang.com/v1/objects/${clientSha}/client.jar`,
      dst: jarPath, size: dl.client?.sha1 === clientSha ? dl.client.size : undefined, sha1: clientSha,
    });
  }
  if (serverSha) {
    jarTasks.push({
      url: dl.server?.url && dl.server.sha1 === serverSha ? dl.server.url : `https://piston-data.mojang.com/v1/objects/${serverSha}/server.jar`,
      dst: serverPath, size: dl.server?.sha1 === serverSha ? dl.server.size : undefined, sha1: serverSha,
    });
  }

  const libTasks = [];
  for (const lib of pkg.libraries || []) {
    const a = lib.downloads?.artifact;
    if (a?.url) libTasks.push({ url: a.url, dst: path.join(dir, 'libraries', a.path), size: a.size, sha1: a.sha1 });
  }

  const objTasks = [];
  if (assetIndex) {
    for (const o of Object.values(assetIndex.objects || {})) {
      const dst = path.join(dir, 'assets', 'objects', o.hash.slice(0, 2), o.hash);
      if (fs.existsSync(dst) && fs.statSync(dst).size === o.size) continue;
      objTasks.push({
        url: `https://resources.download.minecraft.net/${o.hash.slice(0, 2)}/${o.hash}`,
        dst, size: o.size,
      });
    }
  }

  const grandTotal = [...jarTasks, ...libTasks, ...objTasks].reduce((s, t) => s + (t.size || 0), 0);
  let cumulative = 0;
  const report = (label) => (done, count, bytesDone) =>
    onProgress?.({ status: `${label}: ${done}/${count}`, bytesDone: cumulative + bytesDone, bytesTotal: grandTotal });

  onProgress?.({ status: 'Загрузка клиента и сервера с серверов Mojang...', bytesDone: cumulative, bytesTotal: grandTotal });
  await downloadFiles(jarTasks, 2, report('Загрузка jar'));
  cumulative += jarTasks.reduce((s, t) => s + (t.size || 0), 0);

  onProgress?.({ status: 'Загрузка библиотек...', bytesDone: cumulative, bytesTotal: grandTotal });
  await downloadFiles(libTasks, 8, report('Загрузка библиотек'));
  cumulative += libTasks.reduce((s, t) => s + (t.size || 0), 0);

  if (objTasks.length) {
    onProgress?.({ status: 'Загрузка ассетов Mojang...', bytesDone: cumulative, bytesTotal: grandTotal });
    await downloadFiles(objTasks, 12, report('Загрузка ассетов'));
  }

  return { dir, jarPath, serverPath };
}

// --- find a Java runtime >= required major version ---
function listCandidateJavas() {
  const candidates = [];
  if (process.env.JAVA_HOME) candidates.push(path.join(process.env.JAVA_HOME, 'bin', 'java'));
  if (process.platform === 'linux') {
    try {
      for (const name of fs.readdirSync('/usr/lib/jvm')) {
        candidates.push(path.join('/usr/lib/jvm', name, 'bin', 'java'));
      }
    } catch (_) {}
  }
  candidates.push('java');
  return candidates;
}

function javaMajor(javaBin) {
  return new Promise((resolve) => {
    execFile(javaBin, ['-version'], (err, _so, se) => {
      if (err) return resolve(null);
      const m = `${se}`.match(/version "(\d+)(?:\.(\d+))?/);
      if (!m) return resolve(null);
      resolve(m[2] ? parseInt(m[1], 10) === 1 ? parseInt(m[2], 10) : parseInt(m[1], 10) : parseInt(m[1], 10));
    });
  });
}

export async function findJavaAtLeast(minMajor) {
  for (const bin of listCandidateJavas()) {
    const major = await javaMajor(bin);
    if (major !== null && major >= minMajor) return bin;
  }
  return null;
}

// --- run horizon-prepare with the pinned data ---
// onProgress: ({status, bytesDone, bytesTotal})
export async function prepareHorizonResources(versionDir, mcVersion, onProgress) {
  const lockPath = path.join(versionDir, 'research-lock.json');
  let pinnedMc = mcVersion;
  let javaMajorReq = 21;
  let pins = null;
  if (fs.existsSync(lockPath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      pinnedMc = lock.minecraft?.version || pinnedMc;
      javaMajorReq = lock.minecraft?.java_major || javaMajorReq;
      pins = lock.minecraft || null;
    } catch (_) {}
  }

  const prepareBin = path.join(versionDir, process.platform === 'win32' ? 'horizon-prepare.exe' : 'horizon-prepare');
  if (!fs.existsSync(prepareBin)) throw new Error('horizon-prepare не найден в папке версии');

  const already = path.join(versionDir, '.local', 'horizon-client', pinnedMc);
  // Only skip when a *complete* preparation exists: the manifest with the
  // pinned data_version is written last by horizon-prepare.
  if (fs.existsSync(path.join(already, 'horizon-resources.json'))) return already;

  const { dir: mcDir, serverPath } = await ensureMojangDir(pinnedMc, onProgress, pins);

  const javaBin = await findJavaAtLeast(javaMajorReq);
  if (!javaBin) throw new Error(`Нужна Java ${javaMajorReq}+ для подготовки ресурсов, но она не найдена в системе`);

  const env = { ...process.env, JAVA_HOME: path.dirname(path.dirname(javaBin)) };
  const run = (args) => new Promise((resolve, reject) => {
    const child = spawn(prepareBin, args, { cwd: versionDir, env });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('exit', (code) => (code === 0 ? resolve(out) : reject(new Error(`horizon-prepare ${args[0] || ''} завершился с кодом ${code}\n${out.slice(-500)}`))));
    child.on('error', reject);
  });

  onProgress?.({ status: 'Подготовка игровых данных Horizon (несколько минут, не закрывайте лаунчер)...' });
  await run(['--prepare', '--server-jar', serverPath, '--minecraft-dir', mcDir, '--root', versionDir]);

  for (const sub of ['panorama', 'sounds', 'fonts', 'packs', 'languages']) {
    try {
      await run([sub, '--minecraft-dir', mcDir, '--root', versionDir]);
    } catch (_) {}
  }

  return already;
}

export { mojangDirFor };
