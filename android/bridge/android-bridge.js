// Android WebView Bridge for Horizon / Burmalda Launcher

(function() {
  console.log("Initializing Android Launcher Bridge...");

  const DEFAULT_SETTINGS = {
    nickname: 'Player',
    memory: '4G',
    javaArgs: '',
    currentVersion: '26.3',
    fullscreen: true,
    fpsLimit: 120,
    renderDistance: 8,
    activeSkin: 'steve',
    touchControls: {
      hudVisible: true,
      joystickScale: 1.0,
      jumpSneakScale: 1.0,
      cameraSensitivity: 1.0,
      vibration: true
    }
  };

  function getStoredSettings() {
    try {
      const data = localStorage.getItem('r_launcher_settings');
      return data ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(data)) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  function saveStoredSettings(s) {
    try {
      localStorage.setItem('r_launcher_settings', JSON.stringify(s));
    } catch (e) {}
  }

  window.api = {
    getSettings: async () => getStoredSettings(),
    saveSettings: async (settings) => {
      saveStoredSettings(settings);
      return { success: true };
    },
    getStatus: async () => ({
      online: true,
      players: 142,
      maxPlayers: 500,
      motd: 'Horizon Mobile Engine 26.3'
    }),
    getVersions: async () => ({
      minecraftVersions: [{ version: '26.3', label: 'Horizon 26.3 Mobile' }],
      selectedMcVersion: '26.3',
      activeVersion: 'v0.2.97',
      latestStableTag: 'v0.2.97',
      versions: [{
        tag: 'v0.2.97',
        name: 'Horizon 26.3 Mobile',
        isInstalled: true,
        isActive: true,
        prerelease: false
      }]
    }),
    downloadVersion: async (tag) => ({ success: true }),
    setVersion: async (tag, mcVersion) => ({ success: true }),
    rollbackVersion: async () => ({ success: true }),
    selectSkin: async () => ({ success: true }),
    resetSkin: async () => ({ success: true }),
    selectFile: async (opts) => null,
    getSkin: async () => null,
    getDefaultSkins: async () => ([
      { id: 'steve', name: 'Steve', file: 'assets/steve.png' },
      { id: 'alex', name: 'Alex', file: 'assets/alex.png' }
    ]),
    selectDefaultSkin: async (id) => {
      const s = getStoredSettings();
      s.activeSkin = id;
      saveStoredSettings(s);
      return { success: true };
    },
    getWardrobe: async () => ([]),
    addToWardrobe: async (name) => ({ success: true }),
    deleteFromWardrobe: async (id) => ({ success: true }),
    setActiveWardrobeSkin: async (id) => ({ success: true }),
    fetchSkinByName: async (username) => ({ success: true, url: 'assets/steve.png' }),
    launchGame: async (targetServer) => {
      console.log("Launching game from WebView bridge...");
      const s = getStoredSettings();
      const nick = (s && s.nickname && s.nickname.trim().length > 0) ? s.nickname.trim() : 'Player';
      if (window.AndroidLauncher) {
        try {
          window.AndroidLauncher.vibrate(60);
        } catch (e) {}
        window.AndroidLauncher.launchGame(nick);
      } else {
        alert("Запуск игры: " + nick);
      }
      return { success: true };
    },
    killGame: async () => ({ success: true }),
    openFolder: async (type) => ({ success: true }),
    scanMods: async () => ([]),
    getSavedServers: async () => ([
      { name: 'Horizon Official', ip: 'mc.horizon.org', ping: 18, online: true }
    ]),
    saveServers: async (servers) => ({ success: true }),
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
    exportAndroidApk: async () => ({ success: true }),
    installAdbApk: async () => ({ success: true }),
    getFriends: async () => ([]),
    saveFriends: async (friends) => ({ success: true }),
    generateInviteCode: async () => 'HRZ-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    onVersionProgress: (cb) => {},
    onGameLog: (cb) => {},
    onGameExit: (cb) => {},
    windowMin: () => {},
    windowMax: () => {},
    windowClose: () => {}
  };

  // Add tactile feedback to touch interactions
  document.addEventListener('touchstart', (e) => {
    if (e.target && (e.target.closest('button') || e.target.closest('.nav-btn') || e.target.closest('.btn-hero-launch') || e.target.closest('.btn-stage-icon') || e.target.closest('.btn-action-primary') || e.target.closest('.btn-action-secondary') || e.target.closest('.dock-modpack-btn') || e.target.closest('.server-card-clean') || e.target.closest('.dock-player-card') || e.target.closest('.player-nametag-float'))) {
      if (window.AndroidLauncher) {
        try {
          window.AndroidLauncher.vibrate(15);
        } catch (err) {}
      }
    }
  }, { passive: true });

  console.log("Android Launcher Bridge ready!");
})();
