// Android WebView Bridge for Horizon / Burmalda Launcher
// All native work goes through window.AndroidLauncher (LauncherBridge in
// LauncherActivity.java). Every file path used here is relative to the app's
// external files dir: /sdcard/Android/data/org.horizon.client/files
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
        description: 'Чистый официальный клиент Horizon 0.2.97 (Rust Client)',
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
  // structure); they are shared between all engine versions.
  function resourcesInstalled() {
    const a = A();
    return Boolean(a && a.exists('resources/asset-index.json'));
  }

  // ------------------------------------------------------------
  // Engine resource installation handshake:
  //   1. the launcher writes the empty flag file install-assets.flag
  //   2. the engine writes install-progress.txt and removes the flag when done
  // ------------------------------------------------------------
  const INSTALL_FLAG = 'install-assets.flag';
  const INSTALL_PROGRESS = 'install-progress.txt';

  function readInstallProgress() {
    const a = A();
    if (!a) return { installing: false };
    if (!a.exists(INSTALL_FLAG)) return { installing: false, done: true };
    const text = a.readFileText(INSTALL_PROGRESS) || '';
    let percent = 0;
    let status = 'Ожидание движка...';
    if (text.trim().length > 0) {
      const doneRe = /^(done|complete)\b|\bdone 1 1\b/i;
      const errRe = /^error\b/i;
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      status = lines[lines.length - 1].slice(0, 200);
      // Engine format (official_install.rs): "stage percent total" per line,
      // "done 1 1" on success, "error <message> 0 0" on failure.
      if (errRe.test(status)) {
        return { installing: false, failed: true, status: status.replace(/^error\s*/i, 'Ошибка движка: ').slice(0, 200) };
      }
      if (doneRe.test(status)) {
        return { installing: false, done: true, percent: 100, status: 'Ресурсы установлены' };
      }
      const stage = status.match(/^([a-z_]+)\s+(\d{1,3})(?:[.,]\d+)?\s+\d+/i);
      if (stage) {
        const stageNames = {
          preparing: 'Подготовка...',
          metadata: 'Чтение метаданных Mojang...',
          download: 'Скачивание Minecraft-ресурсов...',
          extract: 'Сборка ресурсов...',
          finalize: 'Завершение...'
        };
        percent = Math.min(99, parseInt(stage[2], 10) || 0);
        status = (stageNames[stage[1].toLowerCase()] || stage[1]) + (percent > 0 ? ' ' + percent + '%' : '');
      } else {
        const m = status.match(/(\d{1,3})(?:[.,]\d+)?\s*%/);
        if (m) {
          percent = Math.min(99, parseInt(m[1], 10));
        } else {
          const anyNum = status.match(/\b(\d{1,3})\b/);
          percent = anyNum ? Math.min(50, parseInt(anyNum[1], 10)) : 1; // indeterminate crawl
        }
      }
    }
    return { installing: true, percent, status };
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
        name: 'Horizon — встроен в приложение',
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
      return {
        minecraftVersions: supported.map(v => ({ id: v, name: 'Minecraft ' + v, description: 'Версия Minecraft встроенного движка' })),
        selectedMcVersion: activeMc,
        activeVersion: BUNDLED_ENGINE_TAG,
        latestStableTag: BUNDLED_ENGINE_TAG,
        versions,
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
      try {
        const emit = (percent, status) => versionProgressCbs.forEach(cb => {
          try { cb({ tag: BUNDLED_ENGINE_TAG, percent, status }); } catch (e) {}
        });

        if (resourcesInstalled()) {
          emit(100, 'Minecraft-ресурсы уже установлены');
          return { success: true, tag: BUNDLED_ENGINE_TAG };
        }

        emit(2, 'Запрос установки Minecraft-ресурсов (Minecraft ' + BUNDLED_MC_VERSION + ')...');
        // The installer prefers a launcher-supplied bundle over the APK asset
        // (some engine builds cannot open large APK assets directly).
        if (a.prepareEngineData && !a.prepareEngineData()) {
          return { success: false, error: 'В APK нет таблиц движка (engine-data.zip): переустановите приложение.' };
        }
        if (!a.writeFileText(INSTALL_FLAG, '', false)) {
          return { success: false, error: 'Не удалось создать файл-флаг установки' };
        }
        // Remove the previous run's progress: otherwise the first poll reads
        // the stale error and kills the freshly started engine instantly.
        a.deletePath(INSTALL_PROGRESS);

        // The engine reads the flag only at process start: a leftover engine
        // (e.g. black-screened from a previous failed run) must die first.
        try { a.killGameProcess(); } catch (e) {}
        await new Promise(res => setTimeout(res, 500));

        // the engine processes the flag on start, installs and exits
        const s = getStoredSettings();
        const nick = (s.nickname && s.nickname.trim()) || 'Player';
        a.launchGame(nick);

        const started = Date.now();
        let lastStatus = 'Ожидание движка...';
        const failWith = (error) => {
          try { a.killGameProcess(); } catch (e) {}
          try { a.deletePath(INSTALL_FLAG); } catch (e) {}
          return { success: false, error };
        };
        while (true) {
          await new Promise(res => setTimeout(res, 500));
          const p = readInstallProgress();
          if (!p.installing) {
            if (p.done && resourcesInstalled()) {
              emit(100, p.status || 'Minecraft-ресурсы установлены');
              return { success: true, tag: BUNDLED_ENGINE_TAG };
            }
            if (p.failed) {
              return failWith('Установка Minecraft-ресурсов прервана: ' + (p.status || 'ошибка движка'));
            }
            // the engine consumed the flag without an explicit error record
            return failWith('Установка Minecraft-ресурсов не удалась: ' + lastStatus);
          }
          lastStatus = p.status || lastStatus;
          emit(p.percent, p.status || 'Установка Minecraft-ресурсов...');
          // the engine process died mid-install (flag + stale progress left)
          if (Date.now() - started > 10000 && !a.isGameRunning()) {
            return failWith('Движок завершился во время установки ресурсов. Последний статус: ' + lastStatus);
          }
          // old .so: the engine ignores the flag and just runs the game
          if (Date.now() - started > 15000 && !a.exists(INSTALL_PROGRESS)) {
            return failWith('Установленный движок не умеет скачивать Minecraft-ресурсы (устаревшая версия игры). Обновите APK.');
          }
        }
      } catch (err) {
        return { success: false, error: err && err.message };
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
        // never start the game while the engine is installing resources
        const install = readInstallProgress();
        if (install.installing) {
          return { success: false, error: 'Идёт установка ресурсов: ' + (install.status || 'подождите') };
        }
        if (!resourcesInstalled()) {
          return { success: false, error: 'Ресурсы игры не установлены. Откройте выбор версии и нажмите «Скачать».' };
        }
        try { a.vibrate(60); } catch (e) {}
        syncActiveModpack(); // active modpack must be in place before the engine reads it
        a.launchGame(nick);
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
