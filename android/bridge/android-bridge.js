// Android WebView Bridge for Horizon / Burmalda Launcher
// All native work goes through window.AndroidLauncher (LauncherBridge in
// LauncherActivity.java). Every file path used here is relative to the app's
// data dir: /sdcard/Horizon  (a visible folder on shared storage: it survives
// app updates and even a full uninstall; the app asks for the "All files
// access" permission on first start). Until that permission is granted the
// launcher falls back to /sdcard/Android/media/<pkg>/files.
//
// Engine conventions (see horizon-client sources):
//   - cwd of the game = the files dir above
//   - mods are scanned in  horizon-mods/  (.hmod files and mod folders)
//   - a mod is enabled when horizon-mods.txt contains "mod.<id>:true"
//   - screenshots land in  screenshots/
//   - player name is kept in horizon-player.txt ("name:<nick>")

(function() {
  console.log("Initializing Android Launcher Bridge...");

  // Marker for phone-specific CSS (html.android ...): hides desktop-only UI.
  document.documentElement.classList.add('android');

  const BUNDLED_ENGINE_TAG = 'v0.2.97';
  const LAUNCHER_VERSION = '1.0.0';
  const UPDATE_CONFIG_URLS = [
    'https://gitflic.ru/project/nimbrel/rust-launcher/blob/raw?file=version.json',
    'https://codeberg.org/Nimbrel/rust-launcher/raw/branch/main/version.json',
  ];
  const BROADCAST_CONFIG_URLS = [
    'https://gitflic.ru/project/nimbrel/rust-launcher/blob/raw?file=broadcast.json',
  ];

  function defaultModpacks() {
    return [
      {
        id: 'vanilla',
        name: 'Ванилла',
        version: '26.3',
        isDefault: true,
        description: 'Чистый официальный клиент Horizon 26.3 (Rust Client)',
        mods: [],
        texturepacks: [],
        shaders: []
      },
    ];
  }

  const DEFAULT_SETTINGS = {
    nickname: 'Player',
    memory: '4G',
    javaArgs: '',
    currentVersion: '26.3',
    selectedVersion: BUNDLED_ENGINE_TAG,
    selectedMcVersion: '26.3',
    fullscreen: true,
    fpsLimit: 120,
    renderDistance: 8,
    activeSkin: 'burmalda',
    activeModpackId: 'vanilla',
    modpacks: defaultModpacks(),
    touchControls: {
      hudVisible: true,
      joystickScale: 1.0,
      jumpSneakScale: 1.0,
      cameraSensitivity: 1.0,
      vibration: true
    }
  };

  function A() { return window.AndroidLauncher || null; }

  function parseJson(text, fallback) {
    try { return JSON.parse(text); } catch (e) { return fallback; }
  }

  function getStoredSettings() {
    try {
      const data = localStorage.getItem('r_launcher_settings');
      const merged = data
        ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(data))
        : Object.assign({}, DEFAULT_SETTINGS);
      if (!Array.isArray(merged.modpacks) || merged.modpacks.length === 0) {
        merged.modpacks = defaultModpacks();
      }
      return merged;
    } catch (e) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveStoredSettings(s) {
    try {
      localStorage.setItem('r_launcher_settings', JSON.stringify(s));
    } catch (e) {}
  }

  function filesPath() {
    const a = A();
    return a ? a.getFilesPath() : '';
  }

  // file:// URL usable from the WebView for a file stored under the files dir
  function fileUrl(relPath) {
    const p = filesPath();
    if (!p) return relPath;
    return 'file://' + p + '/' + String(relPath).replace(/^\/+/, '');
  }

  function basename(p) {
    return String(p || '').split(/[\\/]/).pop();
  }

  function sizeFormatted(bytes) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / 1024 / 1024).toFixed(1) + ' МБ';
  }

  function compareSemver(a, b) {
    if (!a || !b) return 0;
    const cleanA = String(a).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const cleanB = String(b).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(cleanA.length, cleanB.length); i++) {
      const valA = cleanA[i] || 0;
      const valB = cleanB[i] || 0;
      if (valA > valB) return 1;
      if (valA < valB) return -1;
    }
    return 0;
  }

  // ------------------------------------------------------------
  // Active modpack -> engine files (horizon-mods/ + horizon-mods.txt)
  // ------------------------------------------------------------

  function extractModId(manifestText) {
    if (!manifestText) return null;
    const m = manifestText.match(/^\s*id\s*=\s*["']([a-z0-9_]{1,64})["']/m);
    return m ? m[1] : null;
  }

  // Mirrors the desktop launch args: every file of the active modpack becomes
  // a real engine addon. The engine reads horizon-mods/ from its cwd.
  function syncActiveModpack() {
    const a = A();
    if (!a) return;
    const s = getStoredSettings();
    const packs = Array.isArray(s.modpacks) ? s.modpacks : [];
    const active = packs.find(p => p.id === s.activeModpackId) || packs.find(p => p.isDefault) || packs[0] || null;

    a.deletePath('horizon-mods');

    const enabledIds = [];
    if (active) {
      const all = [].concat(active.mods || [], active.texturepacks || [], active.shaders || []);
      for (const name of all) {
        const src = 'mods/' + name;
        if (!a.exists(src)) continue;
        const dest = 'horizon-mods/' + name;
        if (!a.copyFile(src, dest)) continue;
        const id = extractModId(a.readZipEntry(dest, 'horizon-mod.toml'));
        if (id) enabledIds.push(id);
      }
    }

    let text = '';
    for (const id of enabledIds) text += 'mod.' + id + ':true\n';
    a.writeFileText('horizon-mods.txt', text, false);
    console.log('Modpack sync: active=' + (active ? active.id : 'none') + ', enabled=[' + enabledIds.join(', ') + ']');
  }

  // ------------------------------------------------------------
  // Download progress / game exit polling
  // ------------------------------------------------------------

  const versionProgressCbs = [];
  let progressTimer = null;

  function startProgressPolling() {
    if (progressTimer) return;
    progressTimer = setInterval(() => {
      const a = A();
      if (!a) return;
      const p = parseJson(a.getDownloadProgress(), null);
      if (!p) return;
      versionProgressCbs.forEach(cb => {
        try { cb(p); } catch (e) {}
      });
      if (!p.running) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }, 400);
  }

  // wait until the single download slot finishes; resolves with final progress
  function waitDownloadDone() {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const a = A();
        const p = a ? parseJson(a.getDownloadProgress(), null) : null;
        if (!p || !p.running) {
          clearInterval(timer);
          resolve(p || { percent: -1, status: 'Ошибка' });
        }
      }, 400);
    });
  }

  const gameExitCbs = [];
  let gameRunningObserved = A() ? A().isGameRunning() : false;

  setInterval(() => {
    const a = A();
    if (!a) return;
    const running = a.isGameRunning();
    if (gameRunningObserved && !running) {
      gameExitCbs.forEach(cb => {
        try { cb(0); } catch (e) {}
      });
    }
    gameRunningObserved = running;
  }, 1500);

  // ------------------------------------------------------------
  // Versions: Horizon NEVER downloads on Android — the engine binary ships
  // inside the APK. Only the Minecraft assets (for the engine's supported
  // vanilla version) are installed on demand via the flag handshake.
  // ------------------------------------------------------------

  const BUNDLED_MC_VERSION = '26.3';

  // The engine installs/prepares resources into files/resources (horizon-prepare
  // structure); they are shared between all engine versions. Both files are
  // written by the engine into the staging folder before its atomic activation,
  // so either both exist (complete install) or neither does.
  function resourcesInstalled() {
    const a = A();
    return Boolean(a
      && a.exists('resources/horizon-resources.json')
      && a.exists('resources/asset-index.json'));
  }

  // ------------------------------------------------------------
  // Engine resource installation handshake:
  //   1. the launcher writes the empty flag file install-assets.flag
  //   2. the engine writes install-progress.txt and removes the flag when done
  // ------------------------------------------------------------
  const INSTALL_FLAG = 'install-assets.flag';
  const INSTALL_PROGRESS = 'install-progress.txt';

  // Turn raw engine/OS errors (usually English) into something a player can
  // act on. The raw text is still logged and kept in rawStatus for debugging.
  function friendlyInstallError(raw) {
    let text = String(raw == null ? '' : raw).trim();
    // Engine format: "error <message> 0 0"; strip the marker and counters.
    text = text.replace(/^error\s+/i, '').replace(/\s+0\s+0$/, '').trim();
    if (!text) {
      return 'Неизвестная ошибка установки. Нажмите «Скачать» ещё раз — установка продолжится с места остановки.';
    }
    const low = text.toLowerCase();
    if (/no space left|enospc|disk full|not enough space/.test(low)) {
      return 'Не хватает свободного места на устройстве. Освободите место и нажмите «Скачать» ещё раз — установка продолжится с места остановки.';
    }
    if (/permission denied|eacces|operation not permitted|read-only file system/.test(low)) {
      return 'Нет доступа к папке игры. Выдайте разрешение «Доступ ко всем файлам» и повторите — установка продолжится с места остановки.';
    }
    if (/network|connection|timed out|timeout|dns|tcp|tls|failed to connect|connection reset|broken pipe|unexpected eof/.test(low)) {
      return 'Нет связи с сервером Mojang. Проверьте интернет и нажмите «Скачать» ещё раз — уже скачанное сохранится.';
    }
    if (/checksum|sha-?1|hash|size mismatch|corrupt|invalid zip|zip error/.test(low)) {
      return 'Скачанный файл повреждён. Нажмите «Скачать» ещё раз — повреждённый файл будет скачан заново, остальное сохранится.';
    }
    if (/could not activate/.test(low)) {
      return 'Не удалось заменить папку ресурсов. Закройте игру и повторите — старая копия сохранена.';
    }
    if (/status code \d|http status|http \d{3}/.test(low)) {
      return 'Сервер Mojang временно недоступен. Проверьте интернет и нажмите «Скачать» ещё раз — скачанное сохранится.';
    }
    if (/no engine-data|apk has no|engine tables bundle has no/.test(low)) {
      return 'В приложении нет таблиц движка. Переустановите APK и повторите.';
    }
    if (/устаревшая версия игры|не умеет скачивать/.test(low)) {
      return 'Этот движок не поддерживает установку ресурсов. Переустановите APK последней версии.';
    }
    if (/client jar differs|implements horizon resources|pinned version/.test(low)) {
      return 'Этот движок не поддерживает установленную версию Minecraft. Обновите APK.';
    }
    if (/internal installation error/.test(low)) {
      return 'Внутренняя ошибка установки. Нажмите «Скачать» ещё раз — установка продолжится с места остановки.';
    }
    if (/не двигается уже 20 минут|зависла/.test(low)) {
      return 'Установка зависла. Нажмите «Скачать» ещё раз — скачанное сохранится, установка продолжится с места остановки.';
    }
    if (/прервалась|завершился во время установки/.test(low)) {
      return 'Установка прервалась. Нажмите «Скачать» ещё раз — она продолжится с места остановки. Если повторяется, проверьте свободное место и интернет.';
    }
    return 'Ошибка установки: ' + text.slice(0, 300);
  }

  // Errors that a retry cannot fix (wrong APK/engine), unlike network, disk
  // or process-death errors which are worth retrying automatically.
  function isFatalInstallError(raw) {
    const low = String(raw == null ? '' : raw).toLowerCase();
    return /no engine-data|apk has no|engine tables bundle has no|client jar differs|implements horizon resources|pinned version|устаревшая версия игры|не умеет скачивать/.test(low);
  }

  function readInstallProgress() {
    const a = A();
    if (!a) return { installing: false, failed: false, done: false, percent: 0, status: 'Мост недоступен' };
    const flag = a.exists(INSTALL_FLAG);
    const text = a.readFileText(INSTALL_PROGRESS) || '';
    let percent = 0;
    let status = flag ? 'Ожидание движка...' : 'Нет данных об установке';
    let last = '';
    if (text.trim().length > 0) {
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      last = lines.length ? lines[lines.length - 1].trim() : '';
    }
    // The engine writes "error <message> 0 0" and then removes the flag. The
    // error must be read BEFORE the missing flag is interpreted as success,
    // otherwise the launcher would silently lose the reason.
    if (/^error\b/i.test(last)) {
      const raw = last.replace(/^error\s*/i, '').replace(/\s+0\s+0$/, '').trim();
      return {
        installing: false,
        failed: true,
        done: false,
        percent: 0,
        status: friendlyInstallError(raw),
        rawStatus: raw,
      };
    }
    if (/^(done|complete)\b/i.test(last)) {
      return { installing: false, failed: false, done: true, percent: 100, status: 'Ресурсы установлены' };
    }
    if (last) {
      const stage = last.match(/^([a-z_]+)\s+(\d{1,3})(?:[.,]\d+)?\s+\d+/i);
      if (stage) {
        const stageNames = {
          preparing: 'Подготовка...',
          metadata: 'Чтение метаданных Mojang...',
          download: 'Скачивание Minecraft-ресурсов...',
          extract: 'Сборка ресурсов...',
          finalize: 'Завершение...'
        };
        const name = stage[1].toLowerCase();
        const raw = Math.min(100, parseInt(stage[2], 10) || 0);
        // One monotonically growing scale: downloading fills 5..85%, then
        // assembling the files continues 85..99%. Without this the bar would
        // fall back to 0% when the engine moves from download to extract.
        if (name === 'download') {
          percent = Math.round(5 + raw * 0.80);
        } else if (name === 'extract') {
          percent = Math.round(85 + raw * 0.14);
        } else if (name === 'finalize') {
          percent = 99;
        } else {
          percent = Math.min(4, raw);
        }
        percent = Math.max(1, Math.min(99, percent));
        status = (stageNames[name] || stage[1]) + (percent > 1 ? ' ' + percent + '%' : '');
      } else {
        const m = last.match(/(\d{1,3})(?:[.,]\d+)?\s*%/);
        if (m) {
          percent = Math.min(99, parseInt(m[1], 10));
        } else {
          const anyNum = last.match(/\b(\d{1,3})\b/);
          percent = anyNum ? Math.min(50, parseInt(anyNum[1], 10)) : 1; // indeterminate crawl
        }
        status = last.slice(0, 200);
      }
    }
    if (flag) {
      return { installing: true, failed: false, done: false, percent, status };
    }
    // The flag is gone but the last record is neither "done" nor "error":
    // the engine was killed or exited without finishing. Never report success
    // here; the caller checks resourcesInstalled() itself and retries.
    return { installing: false, failed: false, done: false, percent, status };
  }

  // ------------------------------------------------------------
  // Default skins (bundled in APK assets)
  // ------------------------------------------------------------

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

  function defaultSkinUrl(id) {
    const found = DEFAULT_SKINS.find(s => s.id === id) || DEFAULT_SKINS[0];
    return { skin: found, url: 'assets/default_skins/' + found.filename };
  }

  // ============================================================

  window.api = {
    isAndroid: true,

    // ---- file operations ----
    exists: async (relPath) => {
      const a = A();
      return Boolean(a && a.exists(relPath));
    },
    readFileText: async (relPath) => {
      const a = A();
      return a ? a.readFileText(relPath) : null;
    },
    writeFileText: async (relPath, text, base64 = false) => {
      const a = A();
      return Boolean(a && a.writeFileText(relPath, text, Boolean(base64)));
    },

    // ---- settings ----
    getSettings: async () => getStoredSettings(),
    saveSettings: async (settings) => {
      saveStoredSettings(settings);
      if (Array.isArray(settings.modpacks)) syncActiveModpack();
      return { success: true };
    },

    // ---- status / update / broadcast ----
    getStatus: async () => {
      const a = A();
      return {
        online: true,
        players: 142,
        maxPlayers: 500,
        motd: 'Horizon Mobile Engine 26.3',
        isGameRunning: a ? a.isGameRunning() : false,
      };
    },

    checkLauncherUpdate: async () => {
      const a = A();
      if (!a) return { checked: false, currentVersion: LAUNCHER_VERSION, isBlocked: false, hasUpdate: false };
      UPDATE_CONFIG_URLS.forEach((url, i) => a.refreshHttpCache(url, 'version' + i + '.json'));
      let best = null;
      for (let i = 0; i < UPDATE_CONFIG_URLS.length; i++) {
        const data = parseJson(a.getHttpCache('version' + i + '.json'), null);
        if (data && data.latestVersion && (!best || compareSemver(data.latestVersion, best.latestVersion) > 0)) {
          best = data;
        }
      }
      if (!best) return { checked: false, currentVersion: LAUNCHER_VERSION, isBlocked: false, hasUpdate: false };
      const minSupported = best.minSupportedVersion || '0.0.0';
      const latest = best.latestVersion;
      return {
        checked: true,
        currentVersion: LAUNCHER_VERSION,
        latestVersion: latest,
        minSupportedVersion: minSupported,
        isBlocked: compareSemver(LAUNCHER_VERSION, minSupported) < 0,
        hasUpdate: compareSemver(LAUNCHER_VERSION, latest) < 0,
        downloadUrl: best.downloadUrl || 'https://burmalda.ru',
        title: best.title || 'Доступно обновление',
        message: best.message || ('Доступна новая версия лаунчера: ' + latest + '.'),
        blockedTitle: best.blockedTitle || 'ВЕРСИЯ УСТАРЕЛА',
        blockedMessage: best.blockedMessage || 'Данная версия лаунчера заблокирована разработчиками.',
      };
    },

    checkBroadcastMessage: async () => {
      const a = A();
      if (!a) return { hasMessage: false };
      a.refreshHttpCache(BROADCAST_CONFIG_URLS[0], 'broadcast.json');
      const data = parseJson(a.getHttpCache('broadcast.json'), null);
      if (!data || !data.message) return { hasMessage: false };
      return {
        hasMessage: true,
        id: String(data.id || data.message.slice(0, 16)),
        title: data.title || 'ОБЪЯВЛЕНИЕ',
        message: data.message,
        buttonText: data.buttonText || null,
        buttonUrl: data.buttonUrl || null,
        canClose: data.canClose !== false,
      };
    },

    openExternalUrl: async (url) => {
      const a = A();
      if (a && typeof url === 'string' && /^https?:\/\//.test(url)) {
        a.openUrl(url);
        return true;
      }
      return false;
    },

    // ---- versions ----
    // Horizon is built into the APK: exactly one non-downloadable engine entry.
    // "Скачать" below means Minecraft assets only (latest vanilla version the
    // bundled engine supports), installed through the flag handshake.
    getVersions: async () => {
      const s = getStoredSettings();
      const supported = [BUNDLED_MC_VERSION];
      let activeMc = s.selectedMcVersion;
      if (!activeMc || !supported.includes(activeMc)) activeMc = BUNDLED_MC_VERSION;
      const versions = [{
        id: BUNDLED_ENGINE_TAG,
        tag: BUNDLED_ENGINE_TAG,
        name: 'Horizon 26.3',
        prerelease: false,
        channel: 'stable',
        status: 'Встроен',
        supportedMcVersions: supported,
        defaultMcVersion: BUNDLED_MC_VERSION,
        publishedAt: '',
        isInstalled: resourcesInstalled(),
        isActive: true,
        assets: [],
      }];
      const install = readInstallProgress();
      return {
        minecraftVersions: supported.map(v => ({ id: v, name: 'Minecraft ' + v, description: 'Версия Minecraft встроенного движка' })),
        selectedMcVersion: activeMc,
        activeVersion: BUNDLED_ENGINE_TAG,
        latestStableTag: BUNDLED_ENGINE_TAG,
        versions,
        // Used by the renderer to resume an interrupted installation on app
        // start instead of making the player press "Скачать" again.
        installInProgress: !resourcesInstalled() && Boolean(install.installing),
        installStatus: install.status || '',
        installPercent: install.percent || 0,
        // A failure that happened while the launcher was closed has no flag
        // left, so "installInProgress" is false and the user would otherwise
        // never see the reason. Surface it on the next start.
        installFailed: !resourcesInstalled() && Boolean(install.failed),
        installError: install.failed ? (install.status || '') : '',
      };
    },

    // Download = Minecraft assets ONLY (Horizon itself is built into the APK).
    // Manual, like on desktop: the user presses "Скачать"; the launcher writes
    // the install-assets.flag handshake file (empty = the latest vanilla
    // version supported by the bundled engine), starts the engine (it fetches
    // everything from Mojang and exits by itself, streaming install-progress.txt),
    // and the launcher shows that progress until completion. Play stays blocked
    // while the flag exists. With an old engine .so that ignores the flag we
    // fail honestly instead of waiting forever.
    downloadVersion: async (tag) => {
      const a = A();
      if (!a) return { success: false, error: 'Мост недоступен' };
      const emit = (percent, status) => versionProgressCbs.forEach(cb => {
        try { cb({ tag: BUNDLED_ENGINE_TAG, percent, status }); } catch (e) {}
      });
      const sleep = (ms) => new Promise(res => setTimeout(res, ms));
      // killProcess() is asynchronous: the old engine may still be writing
      // its progress/flag for a moment. Wait for it to actually disappear so
      // a retry cannot read the previous run's "error" line.
      const killEngineAndWait = async () => {
        try { a.killGameProcess(); } catch (e) {}
        for (let i = 0; i < 20; i++) {
          let running = false;
          try { running = a.isGameRunning(); } catch (e) { running = false; }
          if (!running) return true;
          await sleep(250);
        }
        return false;
      };
      let wakeLock = false;
      const acquireWakeLock = () => {
        try {
          if (typeof a.acquireInstallWakeLock === 'function') {
            wakeLock = Boolean(a.acquireInstallWakeLock());
          }
        } catch (e) {}
      };
      const releaseWakeLock = () => {
        if (!wakeLock) return;
        wakeLock = false;
        try {
          if (typeof a.releaseInstallWakeLock === 'function') a.releaseInstallWakeLock();
        } catch (e) {}
      };
      try {
        if (resourcesInstalled()) {
          emit(100, 'Minecraft-ресурсы уже установлены');
          return { success: true, tag: BUNDLED_ENGINE_TAG };
        }

        acquireWakeLock();
        // The :game foreground service is the keep-alive that survives the
        // launcher being backgrounded/swiped away. launchGame() also starts it
        // when the flag is present; doing it here covers the attached case.
        try { if (typeof a.startInstallService === 'function') a.startInstallService(); } catch (e) {}
        const MAX_ATTEMPTS = 3;
        let lastError = '';

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          // An installation can outlive the launcher WebView (the engine runs
          // in :game). If it is still alive, attach to it instead of killing
          // it and starting over.
          const attached = a.exists(INSTALL_FLAG) && a.isGameRunning();
          if (!attached) {
            // The flag is read only at process start, so kill the old engine
            // BEFORE touching the tables/flag; otherwise it could consume the
            // fresh flag while shutting down or read a half-written zip.
            await killEngineAndWait();
            if (!a.prepareEngineData || !a.prepareEngineData(BUNDLED_ENGINE_TAG)) {
              try { a.deletePath(INSTALL_FLAG); } catch (e) {}
              return { success: false, error: 'Не удалось подготовить таблицы движка (engine-data.zip): проверьте свободное место и доступ к папке игры, при повторе — переустановите APK.' };
            }
            try { a.deletePath(INSTALL_PROGRESS); } catch (e) {}
            // Never let the poll loop read the previous run's error before
            // the new engine has written its first line.
            if (!a.writeFileText(INSTALL_PROGRESS, 'preparing 0 0\n', false)) {
              try { a.deletePath(INSTALL_FLAG); } catch (e) {}
              return { success: false, error: 'Не удалось записать файл прогресса установки. Проверьте доступ к папке игры.' };
            }
            if (!a.writeFileText(INSTALL_FLAG, '', false)) {
              try { a.deletePath(INSTALL_FLAG); } catch (e) {}
              return { success: false, error: 'Не удалось создать файл-флаг установки. Проверьте доступ к папке игры.' };
            }
            // The engine processes the flag on start, installs and exits.
            const s = getStoredSettings();
            const nick = (s.nickname && s.nickname.trim()) || 'Player';
            a.launchGame(nick);
          }

          // Started only after launchGame() returns (it may wait several
          // seconds for the engine window); otherwise the watchdog below
          // would count that time as a dead engine.
          const started = Date.now();
          let lastStatus = attached ? 'Продолжение установки...' : 'Ожидание движка...';
          let lastPercent = -1;
          let lastProgressAt = Date.now();
          let attemptError = null;
          let attemptFatal = false;
          // The bridge pre-writes exactly this line before launching. If it
          // is still untouched after 90 s while the engine is running, the
          // installed .so ignores the flag (an old build): report it instead
          // of waiting for a 20-minute timeout.
          const handshakeText = attached ? '' : 'preparing 0 0';

          while (true) {
            await sleep(500);
            const p = readInstallProgress();
            // Check resources first: the engine reports "done" just before it
            // removes the flag and exits, and a killed cleaner process must
            // not turn a complete install into a failure.
            if (resourcesInstalled()) {
              emit(100, p.status || 'Minecraft-ресурсы установлены');
              return { success: true, tag: BUNDLED_ENGINE_TAG };
            }
            if (p.failed) {
              attemptError = p.status || friendlyInstallError(p.rawStatus || '');
              attemptFatal = isFatalInstallError(p.rawStatus || p.status || '');
              break;
            }
            if (!p.installing) {
              attemptError = friendlyInstallError('Установка прервалась: ' + (p.status || lastStatus));
              break;
            }
            if (p.status) lastStatus = p.status;
            emit(p.percent, p.status || 'Установка Minecraft-ресурсов...');
            if (p.percent !== lastPercent) {
              lastPercent = p.percent;
              lastProgressAt = Date.now();
            }

            const now = Date.now();
            if (!a.isGameRunning()) {
              // Give a just-started process time to appear in the process list.
              if (now - started > 15000) {
                attemptError = friendlyInstallError(
                  'Движок завершился во время установки ресурсов. Последний статус: ' + lastStatus);
                break;
              }
            } else {
              if (handshakeText && now - started > 90000) {
                const current = String(a.readFileText(INSTALL_PROGRESS) || '').trim();
                if (current === handshakeText) {
                  attemptError = 'Установленный движок не умеет скачивать Minecraft-ресурсы (устаревшая версия игры). Обновите APK.';
                  attemptFatal = true;
                  break;
                }
              }
              if (now - lastProgressAt > 20 * 60 * 1000) {
                attemptError = friendlyInstallError(
                  'Установка не двигается уже 20 минут. Последний статус: ' + lastStatus);
                break;
              }
            }
          }

          // A failed attempt: stop the engine, consume the flag and retry.
          // The download cache and the staging folder stay on disk, so the
          // next attempt continues from the current byte/file, not from zero.
          await killEngineAndWait();
          try { a.deletePath(INSTALL_FLAG); } catch (e) {}
          try { if (a.stopInstallService) a.stopInstallService(); } catch (e) {}
          lastError = attemptError || 'Неизвестная ошибка установки. Попробуйте ещё раз.';
          if (attemptFatal || isFatalInstallError(attemptError || '')) {
            return { success: false, error: lastError };
          }
          if (attempt < MAX_ATTEMPTS) {
            emit(1, 'Повторная попытка ' + attempt + '/' + (MAX_ATTEMPTS - 1) + ': ' + lastError);
            await sleep(1500);
            continue;
          }
          return { success: false, error: lastError };
        }
        return { success: false, error: lastError || 'Установка не удалась' };
      } catch (err) {
        await killEngineAndWait();
        try { a.deletePath(INSTALL_FLAG); } catch (e) {}
        try { if (a.stopInstallService) a.stopInstallService(); } catch (e) {}
        return { success: false, error: friendlyInstallError(err && (err.message || err)) };
      } finally {
        releaseWakeLock();
        // The service is only a keep-alive for this download; it must not
        // outlive the attempt even if the engine ignored the flag.
        try { if (typeof a.stopInstallService === 'function') a.stopInstallService(); } catch (e) {}
      }
    },

    setVersion: async (tag, mcVersion) => {
      const s = getStoredSettings();
      s.selectedVersion = tag;
      if (mcVersion) s.selectedMcVersion = mcVersion;
      saveStoredSettings(s);
      return { success: true, activeVersion: tag, selectedMcVersion: s.selectedMcVersion };
    },

    rollbackVersion: async () => {
      const s = getStoredSettings();
      s.selectedVersion = BUNDLED_ENGINE_TAG;
      saveStoredSettings(s);
      return { success: true, activeVersion: BUNDLED_ENGINE_TAG };
    },

    // ---- skins ----
    getSkin: async () => {
      const s = getStoredSettings();
      if (s.skinDataUrl && s.skinPath) {
        return { skinPath: s.skinPath, skinDataUrl: s.skinDataUrl, skinName: s.skinName || 'Скин', skinModel: s.skinModel || 'default', isDefaultSteve: false };
      }
      const def = defaultSkinUrl('burmalda');
      return { skinPath: def.url, skinDataUrl: def.url, skinName: def.skin.name, skinModel: 'default', isDefaultSteve: false };
    },

    getDefaultSkins: async () => DEFAULT_SKINS.map(s => ({
      id: s.id,
      name: s.name,
      model: s.model,
      dataUrl: 'assets/default_skins/' + s.filename,
    })),

    selectDefaultSkin: async (id) => {
      const def = defaultSkinUrl(id);
      const s = getStoredSettings();
      s.activeSkin = def.skin.id;
      s.skinPath = def.url;
      s.skinDataUrl = def.url;
      s.skinName = def.skin.name;
      s.skinModel = def.skin.model;
      saveStoredSettings(s);
      return { success: true, skinPath: def.url, skinDataUrl: def.url, skinName: def.skin.name, skinModel: def.skin.model, isDefault: true };
    },

    resetSkin: async () => window.api.selectDefaultSkin('burmalda'),

    selectFile: async (opts) => {
      const a = A();
      if (!a) return null;
      const exts = ((opts && opts.filters) || [])
        .reduce((acc, f) => acc.concat(f.extensions || []), []).join(',');
      const res = parseJson(a.pickFile('inbox', exts), null);
      return res && res.ok ? res.relPath : null;
    },

    importModFile: async (selectedPath) => {
      const a = A();
      if (!a || !selectedPath) return { success: false, error: 'Файл не выбран' };
      const filename = basename(selectedPath);
      if (!/\.(hmod|hpack|hshader|zip)$/i.test(filename)) {
        return { success: false, error: 'Поддерживаются файлы .hmod, .hpack, .hshader' };
      }
      if (!a.exists(selectedPath)) return { success: false, error: 'Файл не найден' };
      const dest = 'mods/' + filename;
      if (!a.copyFile(selectedPath, dest)) return { success: false, error: 'Не удалось скопировать файл' };
      const size = 0;
      try {
        const info = parseJson(a.listDir('mods'), []).find(f => f.name === filename);
        return {
          success: true,
          filename,
          fullPath: filesPath() + '/' + dest,
          size: info ? info.size : size,
          sizeFormatted: sizeFormatted(info ? info.size : size),
        };
      } catch (e) {
        return { success: true, filename, fullPath: filesPath() + '/' + dest, size, sizeFormatted: sizeFormatted(size) };
      }
    },

    scanMods: async () => {
      const a = A();
      if (!a) return [];
      const entries = parseJson(a.listDir('mods'), []);
      return entries
        .filter(f => !f.isDir && /\.(hmod|hpack|hshader|zip)$/i.test(f.name))
        .map(f => ({
          filename: f.name,
          path: 'mods/' + f.name,
          size: f.size,
          sizeFormatted: sizeFormatted(f.size),
          updatedAt: f.mtime ? new Date(f.mtime).toLocaleDateString() : '',
        }));
    },

    // ---- game launch / lifecycle ----
    launchGame: async (targetServer) => {
      console.log('Launching game from WebView bridge, server=' + targetServer);
      const a = A();
      const s = getStoredSettings();
      const nick = (s && s.nickname && s.nickname.trim().length > 0) ? s.nickname.trim() : 'Player';
      if (a) {
        // If the resources are already complete, a leftover install flag is
        // not a new request: drop the stale handshake before launching.
        if (resourcesInstalled()) {
          try {
            if (a.exists(INSTALL_FLAG)) a.deletePath(INSTALL_FLAG);
            if (a.exists(INSTALL_PROGRESS)) a.deletePath(INSTALL_PROGRESS);
          } catch (e) {}
        }
        // never start the game while the engine is installing resources
        const install = readInstallProgress();
        if (install.installing) {
          return { success: false, error: 'Идёт установка ресурсов: ' + (install.status || 'подождите') };
        }
        if (!resourcesInstalled()) {
          return { success: false, error: 'Ресурсы игры не установлены. Откройте выбор версии и нажмите «Скачать».' };
        }
        try { a.vibrate(60); } catch (e) {}
        try {
          syncActiveModpack(); // active modpack must be in place before the engine reads it
          a.launchGame(nick);
        } catch (e) {
          return { success: false, error: 'Не удалось запустить Minecraft: ' + (e && (e.message || e) || 'неизвестная ошибка') };
        }
      } else {
        alert('Запуск игры: ' + nick);
      }
      return { success: true };
    },

    killGame: async () => {
      const a = A();
      if (a) a.killGameProcess();
      return { success: true };
    },

    openFolder: async (type) => {
      const a = A();
      if (a) a.toast('Папка: ' + filesPath() + '/' + (type || ''));
      return { success: true, path: filesPath() };
    },

    getScreenshots: async () => {
      const a = A();
      if (!a) return [];
      a.mkdir('screenshots');
      const entries = parseJson(a.listDir('screenshots'), []);
      return entries
        .filter(f => !f.isDir && /\.png$/i.test(f.name))
        .sort((x, y) => (y.mtime || 0) - (x.mtime || 0))
        .map(f => ({
          name: f.name,
          path: 'screenshots/' + f.name,
          url: fileUrl('screenshots/' + f.name),
          dataUrl: fileUrl('screenshots/' + f.name),
          size: f.size,
          sizeFormatted: sizeFormatted(f.size),
          updatedAt: f.mtime ? new Date(f.mtime).toLocaleString() : '',
        }));
    },

    openScreenshotsFolder: async () => {
      const a = A();
      if (a) a.toast('Скриншоты: ' + filesPath() + '/screenshots');
      return { success: true, path: filesPath() + '/screenshots' };
    },

    // ---- touch settings ----
    getTouchSettings: async () => {
      const s = getStoredSettings();
      return s.touchControls || DEFAULT_SETTINGS.touchControls;
    },
    saveTouchSettings: async (settings) => {
      const s = getStoredSettings();
      s.touchControls = settings;
      saveStoredSettings(s);
      return { success: true };
    },

    // ---- desktop-only features, no-op on the phone ----
    exportAndroidApk: async () => ({ success: false, error: 'Доступно только вdesktop-версии' }),
    installAdbApk: async () => ({ success: false, error: 'Доступно только вdesktop-версии' }),

    // ---- event subscriptions ----
    onVersionProgress: (cb) => {
      if (typeof cb === 'function') versionProgressCbs.push(cb);
    },
    onGameLog: (cb) => {},
    onGameExit: (cb) => {
      if (typeof cb === 'function') gameExitCbs.push(cb);
    },
    onGameCrashed: (cb) => {
      // same lifecycle signal as onGameExit: any non-manual termination shows as a crash banner
      if (typeof cb === 'function') gameExitCbs.push(cb);
    },

    windowMin: () => {},
    windowMax: () => {},
    windowClose: () => {}
  };

  // Add tactile feedback to touch interactions.
  // The bridge vibrates once on touchstart; renderer-side playUiClickSound() must
  // NOT vibrate again on the follow-up click (that made every tap feel doubled).
  // triggerHapticFeedback() checks this timestamp and skips within the same tap.
  document.addEventListener('touchstart', (e) => {
    if (e.target && (e.target.closest('button') || e.target.closest('.nav-btn') || e.target.closest('.btn-hero-launch') || e.target.closest('.btn-stage-icon') || e.target.closest('.btn-action-primary') || e.target.closest('.btn-action-secondary') || e.target.closest('.dock-modpack-btn') || e.target.closest('.server-card-clean') || e.target.closest('.dock-player-card') || e.target.closest('.player-nametag-float'))) {
      if (window.AndroidLauncher) {
        try {
          window.__burmaldaHapticAt = Date.now();
          window.AndroidLauncher.vibrate(15);
        } catch (err) {}
      }
    }
  }, { passive: true });

  console.log("Android Launcher Bridge ready! filesDir=" + filesPath());
})();
