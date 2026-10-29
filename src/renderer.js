// R-Launcher — Core Frontend Controller
// Pure Human-Crafted Architecture · No AI Slop · High Performance

// --- DOM REFERENCES ---
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Window Controls
const btnWinMin = document.getElementById('btn-win-min');
const btnWinMax = document.getElementById('btn-win-max');
const btnWinClose = document.getElementById('btn-win-close');

// Hero Stage & Steve Controls
const stagePlayerNick = document.getElementById('stage-player-nick');
const btnOpenNametag = document.getElementById('btn-open-nametag');
const skinViewerCanvas = document.getElementById('skin-viewer-3d');
const btnStageWardrobe = document.getElementById('btn-stage-wardrobe');
const btnStageSettings = document.getElementById('btn-stage-settings');
const btnStageFolder = document.getElementById('btn-stage-folder');
const steveHeartsBar = document.getElementById('steve-hearts-bar');
const steveDeathOverlay = document.getElementById('steve-death-overlay');
const btnSteveRespawn = document.getElementById('btn-steve-respawn');

// Servers Tab
const popularServersGrid = document.getElementById('popular-servers-grid');
const inputPlayServer = document.getElementById('input-play-server');
const btnDirectConnect = document.getElementById('btn-direct-connect');
const realServersList = document.getElementById('real-servers-list');
const inputNewSrvName = document.getElementById('input-new-srv-name');
const inputNewSrvAddr = document.getElementById('input-new-srv-addr');
const btnAddServer = document.getElementById('btn-add-server');

// Wardrobe Tab
const wardrobeAvatarCanvas = document.getElementById('wardrobe-avatar-canvas');
const wardrobeSkinName = document.getElementById('wardrobe-skin-name');
const inputProfileNickname = document.getElementById('input-profile-nickname');
const btnSaveProfile = document.getElementById('btn-save-profile');
const btnUploadNewSkin = document.getElementById('btn-upload-new-skin');
const mojangDefaultSkinsGrid = document.getElementById('mojang-default-skins-grid');
const customWardrobeStrip = document.getElementById('custom-wardrobe-strip');
const inputFetchSkinNick = document.getElementById('input-fetch-skin-nick');
const btnFetchSkinByNick = document.getElementById('btn-fetch-skin-by-nick');

// Settings Tab
const settingRamSelect = document.getElementById('setting-ram-select');
const settingGpuToggle = document.getElementById('setting-gpu-toggle');
const settingFullscreenToggle = document.getElementById('setting-fullscreen-toggle');
const settingCustomArgs = document.getElementById('setting-custom-args');

// Command Dock
const dockPlayerCard = document.getElementById('dock-player-card');
const dockAvatar = document.getElementById('dock-avatar');
const dockPlayerName = document.getElementById('dock-player-name');
const btnHeroAction = document.getElementById('btn-hero-action');
const heroBtnText = document.getElementById('hero-btn-text');
const heroBtnIcon = document.getElementById('hero-btn-icon');

// Two-Tier Version Selectors
const triggerMcVersion = document.getElementById('trigger-mc-version');
const selectedMcVersionLabel = document.getElementById('selected-mc-version-label');
const menuMcVersions = document.getElementById('menu-mc-versions');

const triggerEngineVersion = document.getElementById('trigger-engine-version');
const selectedEngineVersionLabel = document.getElementById('selected-engine-version-label');
const menuEngineVersions = document.getElementById('menu-engine-versions');

// Modpack Manager Elements
const triggerModpackManager = document.getElementById('trigger-modpack-manager');
const dockModpackName = document.getElementById('dock-modpack-name');
const modalModpacks = document.getElementById('modal-modpacks');
const btnCloseModpacksModal = document.getElementById('btn-close-modpacks-modal');

const tabBtnModpackList = document.getElementById('tab-btn-modpack-list');
const tabBtnModpackCatalog = document.getElementById('tab-btn-modpack-catalog');

const viewModpackList = document.getElementById('view-modpack-list');
const viewModpackCreate = document.getElementById('view-modpack-create');
const viewModpackCatalog = document.getElementById('view-modpack-catalog');

const modpackCardsContainer = document.getElementById('modpack-cards-container');
const btnOpenCreateModpack = document.getElementById('btn-open-create-modpack');
const btnBackFromCreate = document.getElementById('btn-back-from-create');
const btnCancelCreatePack = document.getElementById('btn-cancel-create-pack');
const btnSaveNewPack = document.getElementById('btn-save-new-pack');
const inputNewPackName = document.getElementById('input-new-pack-name');

const badgeCountMods = document.getElementById('badge-count-mods');
const badgeCountTextures = document.getElementById('badge-count-textures');
const badgeCountShaders = document.getElementById('badge-count-shaders');

const chipsPackMods = document.getElementById('chips-pack-mods');
const chipsPackTextures = document.getElementById('chips-pack-textures');
const chipsPackShaders = document.getElementById('chips-pack-shaders');

const btnPickModsCat = document.getElementById('btn-pick-mods-cat');
const btnPickTexCat = document.getElementById('btn-pick-tex-cat');
const btnPickShaCat = document.getElementById('btn-pick-sha-cat');

const btnFileMods = document.getElementById('btn-file-mods');
const btnFileTextures = document.getElementById('btn-file-textures');
const btnFileShaders = document.getElementById('btn-file-shaders');

const catalogItemsGrid = document.getElementById('catalog-items-grid');
const catalogCategoryFilter = document.getElementById('catalog-category-filter');
const inputCatalogSearch = document.getElementById('input-catalog-search');

// Download Progress Strip
const downloadProgressStrip = document.getElementById('download-progress-strip');
const downloadStripStatus = document.getElementById('download-strip-status');
const downloadStripPercent = document.getElementById('download-strip-percent');
const downloadStripFill = document.getElementById('download-strip-fill');

// --- POPULAR MINECRAFT SERVERS (Curated) ---
const POPULAR_SERVERS = [
  { name: 'Hypixel Network', address: 'mc.hypixel.net', desc: 'Мини-игры, BedWars, SkyBlock' },
  { name: 'FunTime', address: 'mc.funtime.su', desc: 'Анархия, PvP, Топовый СНГ сервер' },
  { name: 'ReallyWorld', address: 'mc.reallyworld.ru', desc: 'Гриферский, Выживание, Квесты' },
  { name: 'HolyWorld', address: 'mc.holyworld.ru', desc: 'Анархия с уникальными боссами' },
  { name: 'CubeCraft Games', address: 'play.cubecraft.net', desc: 'EggWars, SkyWars, Паркур' },
  { name: 'Mineplex Studio', address: 'us.mineplex.com', desc: 'Классические аркады и турниры' }
];

// --- CURATED CATALOG ITEMS ---
const CATALOG_ITEMS = [
  {
    id: 'mod-touch-controls',
    category: 'mods',
    name: 'Mobile Touch Controls',
    author: 'Horizon Official',
    downloads: '1.2M',
    desc: 'Официальный мод сенсорного управления для телефонов и мобильных устройств: виртуальный стик, жесты ломания/атаки, ванильные настройки.'
  },
  {
    id: 'mod-sodium',
    category: 'mods',
    name: 'Sodium',
    author: 'jellysquid3',
    downloads: '28.4M',
    desc: 'Революционный графический движок. Поднимает FPS на 200-400% без потери качества картинки.'
  },
  {
    id: 'mod-iris',
    category: 'mods',
    name: 'Iris Shaders',
    author: 'coderbot',
    downloads: '19.2M',
    desc: 'Современная и сверхбыстрая поддержка шейдеров OptiFine на базе ядра Sodium.'
  },
  {
    id: 'mod-appleskin',
    category: 'mods',
    name: 'AppleSkin',
    author: 'squeek502',
    downloads: '42.1M',
    desc: 'Наглядные индикаторы насыщения еды, уровня истощения и восстановления сердец.'
  },
  {
    id: 'mod-fastcraft',
    category: 'mods',
    name: 'FastCraft Pro',
    author: 'Player',
    downloads: '5.8M',
    desc: 'Оптимизация рендеринга чанков, ускорение многопоточной загрузки мира.'
  },
  {
    id: 'mod-zoomify',
    category: 'mods',
    name: 'Zoomify',
    author: 'isXander',
    downloads: '9.4M',
    desc: 'Плавный зум с кинематографическим сглаживанием камеры и поддержкой колесика мыши.'
  },
  {
    id: 'mod-lithium',
    category: 'mods',
    name: 'Lithium',
    author: 'jellysquid3',
    downloads: '31.5M',
    desc: 'Комплексная оптимизация серверного тика, физики мобов и симуляции мира.'
  },
  {
    id: 'tex-faithful',
    category: 'textures',
    name: 'Faithful 32x',
    author: 'Faithful Team',
    downloads: '16.7M',
    desc: 'Классические оригинальные текстуры Minecraft в двойном высоком разрешении 32x32.'
  },
  {
    id: 'tex-barebones',
    category: 'textures',
    name: 'Bare Bones',
    author: 'RobotPantaloons',
    downloads: '8.1M',
    desc: 'Упрощенный минималистичный стиль как в официальных трейлерах Mojang.'
  },
  {
    id: 'tex-fresh-anim',
    category: 'textures',
    name: 'Fresh Animations',
    author: 'FreshLX',
    downloads: '14.2M',
    desc: 'Потрясающие живые анимации мобов, моргание глаз и естественные движения.'
  },
  {
    id: 'sha-complementary',
    category: 'shaders',
    name: 'Complementary Reimagined',
    author: 'EminGT',
    downloads: '22.3M',
    desc: 'Великолепные объемные облака, реалистичная вода, динамические лучи солнца и мягкие тени.'
  },
  {
    id: 'sha-bsl',
    category: 'shaders',
    name: 'BSL Shaders',
    author: 'Capt Tatsu',
    downloads: '18.9M',
    desc: 'Один из самых популярных шейдеров с атмосферным освещением и высокой производительностью.'
  },
  {
    id: 'sha-solas',
    category: 'shaders',
    name: 'Solas Shaders',
    author: 'Septivium',
    downloads: '4.6M',
    desc: 'Новейший быстрый шейдерпак с продвинутыми эффектами тумана, свечения и отражений.'
  }
];

// --- APPLICATION STATE ---
let isRunning = false;
let isDownloading = false;
let currentVersionsData = { versions: [], activeVersion: 'v0.2.97', latestStableTag: 'v0.2.97' };
let currentSettings = {};
let savedServers = [];
let defaultSkinsList = [];
let wardrobeList = [];
let skinViewer = null;

// Steve Interaction, Ragdoll & Health State
let steveHp = 20; // Max 20 HP (10 hearts)
let isSteveDead = false;
let targetHeadYaw = 0;
let targetHeadPitch = 0;
let currentHeadYaw = 0;
let currentHeadPitch = 0;
let nextBlinkTime = Date.now() + 3000;
let isBlinking = false;
let simTime = 0;

// Mouse Drag Physics
let isDraggingSteve = false;
let dragStartX = 0;
let dragStartY = 0;
let dragLastX = 0;
let dragLastY = 0;
let dragDistance = 0;
let dragVelX = 0;
let dragVelY = 0;

// Creation state for new Modpack
let newPackData = {
  name: '',
  version: '26.3',
  mods: [],
  texturepacks: [],
  shaders: []
};
let activeCatalogCategory = 'mods';

// --- WINDOW CONTROLS ---
btnWinMin?.addEventListener('click', () => window.api.windowMin());
btnWinMax?.addEventListener('click', () => window.api.windowMax());
btnWinClose?.addEventListener('click', () => window.api.windowClose());

// --- TAB NAVIGATION (MORPHING PILLS) ---
function switchTab(tabName) {
  navBtns.forEach((b) => {
    if (b.getAttribute('data-tab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  tabContents.forEach((c) => c.classList.remove('active'));
  const targetPane = document.getElementById(`pane-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  if (tabName === 'wardrobe') {
    refreshWardrobeUI();
  } else if (tabName === 'servers') {
    renderServersUI();
  } else if (tabName === 'friends') {
    renderFriendsUI();
  } else if (tabName === 'settings') {
    loadTouchSettingsUI();
  }
}

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    if (tabName) switchTab(tabName);
  });
});

btnStageWardrobe?.addEventListener('click', () => switchTab('wardrobe'));
btnStageSettings?.addEventListener('click', () => switchTab('settings'));
btnOpenNametag?.addEventListener('click', () => switchTab('wardrobe'));
dockPlayerCard?.addEventListener('click', () => switchTab('wardrobe'));

// --- STEVE 3D VIEWER WITH PHYSICS, DRAGGING & RAGDOLL ---
const hitPhysics = {
  headPitch: 0, headPitchVel: 0,
  headYaw: 0, headYawVel: 0,
  headRoll: 0, headRollVel: 0,

  torsoPitch: 0, torsoPitchVel: 0,
  torsoRoll: 0, torsoRollVel: 0,
  bodyTiltZ: 0, bodyTiltZVel: 0,

  recoilZ: 0, recoilZVel: 0,
  recoilY: 0, recoilYVel: 0,

  lArmPitch: 0, lArmPitchVel: 0,
  lArmRoll: 0, lArmRollVel: 0,
  rArmPitch: 0, rArmPitchVel: 0,
  rArmRoll: 0, rArmRollVel: 0,

  lLegPitch: 0, lLegPitchVel: 0,
  rLegPitch: 0, rLegPitchVel: 0
};

// Web Audio API Sound Synthesizer (Realistic Minecraft sound effects)
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playMinecraftHitSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  } catch (_) {}
}

function playMinecraftDeathSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.45);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.46);
  } catch (_) {}
}

function playMinecraftTotemSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.2, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.26);
    });
  } catch (_) {}
}

// Spring step (Hooke's law with viscous damping)
function stepSpring(posKey, velKey, stiffness = 0.14, damping = 0.82) {
  const force = -stiffness * hitPhysics[posKey] - (1 - damping) * hitPhysics[velKey];
  hitPhysics[velKey] += force;
  hitPhysics[posKey] += hitPhysics[velKey];
}

// Render 10 authentic pixel-art Minecraft Hearts
function renderSteveHearts() {
  if (!steveHeartsBar) return;
  steveHeartsBar.innerHTML = '';
  steveHeartsBar.title = `Здоровье Стива: ${steveHp}/20 HP`;

  for (let i = 0; i < 10; i++) {
    const heartVal = steveHp - i * 2;
    let heartType = 'empty';
    if (heartVal >= 2) heartType = 'full';
    else if (heartVal === 1) heartType = 'half';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'heart-svg');
    svg.setAttribute('viewBox', '0 0 9 9');

    if (heartType === 'full') {
      svg.innerHTML = `
        <rect x="1" y="0" width="3" height="1" fill="#000"/>
        <rect x="5" y="0" width="3" height="1" fill="#000"/>
        <rect x="0" y="1" width="1" height="3" fill="#000"/>
        <rect x="4" y="1" width="1" height="2" fill="#000"/>
        <rect x="8" y="1" width="1" height="3" fill="#000"/>
        <rect x="1" y="4" width="1" height="2" fill="#000"/>
        <rect x="7" y="4" width="1" height="2" fill="#000"/>
        <rect x="2" y="6" width="1" height="1" fill="#000"/>
        <rect x="6" y="6" width="1" height="1" fill="#000"/>
        <rect x="3" y="7" width="1" height="1" fill="#000"/>
        <rect x="5" y="7" width="1" height="1" fill="#000"/>
        <rect x="4" y="8" width="1" height="1" fill="#000"/>
        <!-- Red Fill -->
        <rect x="1" y="1" width="3" height="3" fill="#dc2626"/>
        <rect x="5" y="1" width="3" height="3" fill="#dc2626"/>
        <rect x="2" y="4" width="5" height="2" fill="#dc2626"/>
        <rect x="3" y="6" width="3" height="1" fill="#dc2626"/>
        <rect x="4" y="7" width="1" height="1" fill="#dc2626"/>
        <!-- White Highlight -->
        <rect x="2" y="1" width="1" height="1" fill="#ffffff"/>
      `;
    } else if (heartType === 'half') {
      svg.innerHTML = `
        <rect x="1" y="0" width="3" height="1" fill="#000"/>
        <rect x="5" y="0" width="3" height="1" fill="#000"/>
        <rect x="0" y="1" width="1" height="3" fill="#000"/>
        <rect x="4" y="1" width="1" height="2" fill="#000"/>
        <rect x="8" y="1" width="1" height="3" fill="#000"/>
        <rect x="1" y="4" width="1" height="2" fill="#000"/>
        <rect x="7" y="4" width="1" height="2" fill="#000"/>
        <rect x="2" y="6" width="1" height="1" fill="#000"/>
        <rect x="6" y="6" width="1" height="1" fill="#000"/>
        <rect x="3" y="7" width="1" height="1" fill="#000"/>
        <rect x="5" y="7" width="1" height="1" fill="#000"/>
        <rect x="4" y="8" width="1" height="1" fill="#000"/>
        <!-- Left Half Red -->
        <rect x="1" y="1" width="3" height="3" fill="#dc2626"/>
        <rect x="2" y="4" width="2" height="2" fill="#dc2626"/>
        <rect x="3" y="6" width="1" height="1" fill="#dc2626"/>
        <!-- Right Half Dark Empty -->
        <rect x="5" y="1" width="3" height="3" fill="#1f2937"/>
        <rect x="4" y="3" width="3" height="3" fill="#1f2937"/>
        <rect x="4" y="6" width="2" height="1" fill="#1f2937"/>
        <rect x="4" y="7" width="1" height="1" fill="#1f2937"/>
        <!-- White Highlight -->
        <rect x="2" y="1" width="1" height="1" fill="#ffffff"/>
      `;
    } else {
      svg.innerHTML = `
        <rect x="1" y="0" width="3" height="1" fill="#000"/>
        <rect x="5" y="0" width="3" height="1" fill="#000"/>
        <rect x="0" y="1" width="1" height="3" fill="#000"/>
        <rect x="4" y="1" width="1" height="2" fill="#000"/>
        <rect x="8" y="1" width="1" height="3" fill="#000"/>
        <rect x="1" y="4" width="1" height="2" fill="#000"/>
        <rect x="7" y="4" width="1" height="2" fill="#000"/>
        <rect x="2" y="6" width="1" height="1" fill="#000"/>
        <rect x="6" y="6" width="1" height="1" fill="#000"/>
        <rect x="3" y="7" width="1" height="1" fill="#000"/>
        <rect x="5" y="7" width="1" height="1" fill="#000"/>
        <rect x="4" y="8" width="1" height="1" fill="#000"/>
        <!-- Empty interior -->
        <rect x="1" y="1" width="3" height="3" fill="#1e293b"/>
        <rect x="5" y="1" width="3" height="3" fill="#1e293b"/>
        <rect x="2" y="4" width="5" height="2" fill="#1e293b"/>
        <rect x="3" y="6" width="3" height="1" fill="#1e293b"/>
        <rect x="4" y="7" width="1" height="1" fill="#1e293b"/>
      `;
    }
    steveHeartsBar.appendChild(svg);
  }
}

// Deal damage to Steve
function damageSteve(amount, relX, relY) {
  if (isSteveDead) return;

  steveHp = Math.max(0, steveHp - amount);
  playMinecraftHitSound();

  // Shake hearts bar
  if (steveHeartsBar) {
    steveHeartsBar.classList.add('shaking');
    setTimeout(() => steveHeartsBar.classList.remove('shaking'), 250);
  }

  // Red damage flash on 3D canvas
  if (skinViewerCanvas) {
    skinViewerCanvas.style.filter = 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.9)) brightness(1.3) sepia(0.6) hue-rotate(310deg)';
    setTimeout(() => {
      if (skinViewerCanvas) skinViewerCanvas.style.filter = '';
    }, 130);
  }

  // Punch recoil impulse based on where hit landed
  if (relY < 0.38) {
    // Head hit
    hitPhysics.headPitchVel -= 0.8;
    hitPhysics.headYawVel -= relX * 0.9;
    hitPhysics.recoilZVel -= 2.6;
    hitPhysics.bodyTiltZVel += (relX >= 0 ? -0.22 : 0.22);
  } else if (relY < 0.68) {
    // Torso hit
    hitPhysics.torsoPitchVel += 0.6;
    hitPhysics.recoilZVel -= 3.8;
    hitPhysics.recoilYVel += 1.2;
    hitPhysics.bodyTiltZVel += (Math.random() > 0.5 ? 0.2 : -0.2);
  } else {
    // Legs hit
    hitPhysics.recoilYVel -= 1.8;
    hitPhysics.recoilZVel -= 2.0;
  }

  renderSteveHearts();

  // Check death state
  if (steveHp <= 0) {
    triggerSteveDeath();
  }
}

// Steve Ragdoll Death Collapse
function triggerSteveDeath() {
  isSteveDead = true;
  playMinecraftDeathSound();

  if (steveDeathOverlay) {
    steveDeathOverlay.style.display = 'flex';
  }
}

// Respawn Steve back to life
btnSteveRespawn?.addEventListener('click', () => {
  isSteveDead = false;
  steveHp = 20;
  playMinecraftTotemSound();

  if (steveDeathOverlay) {
    steveDeathOverlay.style.display = 'none';
  }

  // Reset ragdoll velocities
  Object.keys(hitPhysics).forEach((k) => (hitPhysics[k] = 0));

  renderSteveHearts();
});

// Initialize 3D Steve SkinViewer (ZERO jitter, custom unified physics)
function initSkinViewer(skinSrc) {
  if (!skinViewerCanvas) return;
  const resolved = skinSrc || 'assets/default_skins/steve.png';

  try {
    if (window.skinview3d && !skinViewer) {
      skinViewer = new window.skinview3d.SkinViewer({
        canvas: skinViewerCanvas,
        width: 360,
        height: 440,
        skin: resolved
      });

      skinViewer.camera.position.z = 62;
      skinViewer.camera.position.y = -2;
      skinViewer.fov = 56;
      skinViewer.controls.enableRotate = false; // We handle dragging and physics directly!
      skinViewer.controls.enableZoom = false;
      skinViewer.controls.enablePan = false;

      // DO NOT set skinViewer.animation to avoid internal loop fighting!
      skinViewer.animation = null;

      setupSteveInteractiveControls();
    } else if (skinViewer) {
      skinViewer.loadSkin(resolved);
    }
  } catch (err) {
    console.warn('3D SkinViewer fallback:', err);
  }
}

// Setup Dragging, Pushing & Punching on Steve
function setupSteveInteractiveControls() {
  if (!skinViewerCanvas) return;

  // Track cursor across window for natural head orientation
  window.addEventListener('mousemove', (e) => {
    if (isSteveDead || !skinViewer || !skinViewer.playerObject) return;
    const rect = skinViewerCanvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.3;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 600) {
      targetHeadYaw = Math.max(-0.55, Math.min(0.55, dx / 350));
      targetHeadPitch = Math.max(-0.35, Math.min(0.35, dy / 300));
    } else {
      targetHeadYaw = 0;
      targetHeadPitch = 0;
    }
  });

  // Mouse Down: Start drag
  skinViewerCanvas.addEventListener('mousedown', (e) => {
    isDraggingSteve = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
    dragDistance = 0;
    dragVelX = 0;
    dragVelY = 0;
  });

  // Window Mouse Move while dragging
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingSteve || isSteveDead) return;
    const dx = e.clientX - dragLastX;
    const dy = e.clientY - dragLastY;

    dragDistance += Math.hypot(dx, dy);
    dragVelX = dx;
    dragVelY = dy;
    dragLastX = e.clientX;
    dragLastY = e.clientY;

    // Direct physical body pull during drag
    hitPhysics.bodyTiltZVel -= dx * 0.008;
    hitPhysics.recoilZVel += dy * 0.04;
    hitPhysics.headYawVel += dx * 0.012;
    hitPhysics.torsoRollVel -= dx * 0.006;
  });

  // Window Mouse Up: End drag, trigger hit or fling push!
  window.addEventListener('mouseup', (e) => {
    if (!isDraggingSteve) return;
    isDraggingSteve = false;

    if (dragDistance < 7) {
      // Short click on canvas: Punch / Hit!
      const rect = skinViewerCanvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const relX = (clickX - rect.width / 2) / (rect.width / 2);
        const relY = clickY / rect.height;

        const damage = Math.floor(Math.random() * 3) + 2; // 2 to 4 HP
        damageSteve(damage, relX, relY);
      }
    } else if (!isSteveDead) {
      // Drag released with velocity: Fling / Push Steve!
      hitPhysics.bodyTiltZVel = -dragVelX * 0.04;
      hitPhysics.headYawVel = -dragVelX * 0.06;
      hitPhysics.recoilZVel = dragVelY * 0.12;
      hitPhysics.torsoRollVel = -dragVelX * 0.025;
    }
  });

  // Main Unified Render & Physics Animation Loop
  function updateSteveFrame() {
    simTime += 0.025;

    if (skinViewer && skinViewer.playerObject && skinViewer.playerObject.skin) {
      const skin = skinViewer.playerObject.skin;
      const head = skin.head;
      const torso = skin.torso;
      const leftArm = skin.leftArm;
      const rightArm = skin.rightArm;
      const leftLeg = skin.leftLeg;
      const rightLeg = skin.rightLeg;

      if (isSteveDead) {
        // --- DEAD RAGDOLL COLLAPSE STATE ---
        // Steve lies collapsed 90 degrees on floor
        skinViewer.playerObject.position.y += (-16 - skinViewer.playerObject.position.y) * 0.15;
        skinViewer.playerObject.position.x += (6 - skinViewer.playerObject.position.x) * 0.15;
        skinViewer.playerObject.position.z += (0 - skinViewer.playerObject.position.z) * 0.15;
        skinViewer.playerObject.rotation.z += (Math.PI / 2 - skinViewer.playerObject.rotation.z) * 0.18;

        if (head) {
          head.rotation.x = 0.25;
          head.rotation.y = 0.45;
          head.rotation.z = 0.1;
        }
        if (torso) {
          torso.rotation.x = 0.05;
          torso.rotation.z = 0;
        }
        if (leftArm) {
          leftArm.rotation.x = 1.2;
          leftArm.rotation.z = 0.4;
        }
        if (rightArm) {
          rightArm.rotation.x = -0.7;
          rightArm.rotation.z = -0.3;
        }
        if (leftLeg) {
          leftLeg.rotation.x = -0.4;
        }
        if (rightLeg) {
          rightLeg.rotation.x = 0.5;
        }
      } else {
        // --- ALIVE PHYSICS & BREATHING STATE ---
        // Return whole player root smoothly
        skinViewer.playerObject.position.x += (0 - skinViewer.playerObject.position.x) * 0.15;

        // 1. Natural mouse-follow interpolation
        currentHeadYaw += (targetHeadYaw - currentHeadYaw) * 0.12;
        currentHeadPitch += (targetHeadPitch - currentHeadPitch) * 0.12;

        // 2. Step spring-damper physics simulation
        stepSpring('headPitch', 'headPitchVel', 0.16, 0.82);
        stepSpring('headYaw', 'headYawVel', 0.16, 0.82);
        stepSpring('headRoll', 'headRollVel', 0.16, 0.82);

        stepSpring('torsoPitch', 'torsoPitchVel', 0.14, 0.80);
        stepSpring('torsoRoll', 'torsoRollVel', 0.14, 0.80);
        stepSpring('bodyTiltZ', 'bodyTiltZVel', 0.15, 0.78);

        stepSpring('recoilZ', 'recoilZVel', 0.13, 0.82);
        stepSpring('recoilY', 'recoilYVel', 0.14, 0.80);

        stepSpring('lArmPitch', 'lArmPitchVel', 0.12, 0.83);
        stepSpring('lArmRoll', 'lArmRollVel', 0.12, 0.83);
        stepSpring('rArmPitch', 'rArmPitchVel', 0.12, 0.83);
        stepSpring('rArmRoll', 'rArmRollVel', 0.12, 0.83);

        stepSpring('lLegPitch', 'lLegPitchVel', 0.12, 0.82);
        stepSpring('rLegPitch', 'rLegPitchVel', 0.12, 0.82);

        // 3. Gentle sinusoidal idle breathing
        const breath = Math.sin(simTime * 1.6) * 0.022;
        const armSway = Math.sin(simTime * 1.2) * 0.035;

        // 4. Apply calculated positions to 3D bones
        if (head) {
          head.rotation.y = currentHeadYaw + hitPhysics.headYaw;
          head.rotation.x = currentHeadPitch + hitPhysics.headPitch;
          head.rotation.z = hitPhysics.headRoll;
        }

        if (torso) {
          torso.rotation.x = breath + hitPhysics.torsoPitch;
          torso.rotation.z = hitPhysics.torsoRoll;
        }

        if (leftArm) {
          leftArm.rotation.x = armSway + hitPhysics.lArmPitch;
          leftArm.rotation.z = Math.abs(breath) * 0.5 + hitPhysics.lArmRoll;
        }

        if (rightArm) {
          rightArm.rotation.x = -armSway + hitPhysics.rArmPitch;
          rightArm.rotation.z = -Math.abs(breath) * 0.5 + hitPhysics.rArmRoll;
        }

        if (leftLeg) {
          leftLeg.rotation.x = hitPhysics.lLegPitch;
        }

        if (rightLeg) {
          rightLeg.rotation.x = hitPhysics.rLegPitch;
        }

        // 5. Whole body position and tilt
        skinViewer.playerObject.position.z = hitPhysics.recoilZ;
        skinViewer.playerObject.position.y = hitPhysics.recoilY;
        skinViewer.playerObject.rotation.z = hitPhysics.bodyTiltZ;
      }
    }

    requestAnimationFrame(updateSteveFrame);
  }

  requestAnimationFrame(updateSteveFrame);
}

// --- GLOBAL SKIN & WARDROBE UPDATER ---
function updateSkinUI(dataUrl, skinName = 'Стив') {
  const activeUrl = dataUrl || 'assets/default_skins/steve.png';

  initSkinViewer(activeUrl);

  const img = new Image();
  img.onload = () => {
    if (dockAvatar) drawAvatarHead(dockAvatar, img);
    if (wardrobeAvatarCanvas) drawAvatarHead(wardrobeAvatarCanvas, img);
  };
  img.src = activeUrl;

  if (wardrobeSkinName) wardrobeSkinName.textContent = `Скин: ${skinName}`;
}

function drawAvatarHead(canvas, img) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Base head layer (8x8 at 8,8 on Minecraft skin)
  ctx.drawImage(img, 8, 8, 8, 8, 0, 0, canvas.width, canvas.height);

  // Helmet / Hat overlay (8x8 at 40,8 on Minecraft skin)
  try {
    ctx.drawImage(img, 40, 8, 8, 8, 0, 0, canvas.width, canvas.height);
  } catch (_) {}
}

function updateNicknameUI(nick) {
  const clean = nick || 'Player';
  if (stagePlayerNick) stagePlayerNick.textContent = clean;
  if (dockPlayerName) dockPlayerName.textContent = clean;
  if (inputProfileNickname) inputProfileNickname.value = clean;
}

// Save Profile Nickname
btnSaveProfile?.addEventListener('click', async () => {
  const nick = inputProfileNickname?.value.trim() || 'Player';
  currentSettings.nickname = nick;
  updateNicknameUI(nick);
  await window.api.saveSettings(currentSettings);
});

inputProfileNickname?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const nick = inputProfileNickname.value.trim() || 'Player';
    currentSettings.nickname = nick;
    updateNicknameUI(nick);
    await window.api.saveSettings(currentSettings);
  }
});

// --- WARDROBE TAB ---
async function refreshWardrobeUI() {
  defaultSkinsList = await window.api.getDefaultSkins();
  renderDefaultSkinsGrid();

  wardrobeList = await window.api.getWardrobe();
  renderCustomWardrobeStrip();
}

function renderDefaultSkinsGrid() {
  if (!mojangDefaultSkinsGrid) return;
  mojangDefaultSkinsGrid.innerHTML = '';

  const activeSkinName = currentSettings.skinName || 'Стив';

  defaultSkinsList.forEach((skin) => {
    const card = document.createElement('div');
    card.className = 'skin-thumbnail-card';
    if (skin.name === activeSkinName) card.classList.add('selected');

    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 44;
    canvas.className = 'skin-thumb-canvas';

    const img = new Image();
    img.onload = () => drawAvatarHead(canvas, img);
    img.src = skin.dataUrl;

    const label = document.createElement('span');
    label.className = 'skin-thumb-name';
    label.textContent = skin.name;

    card.appendChild(canvas);
    card.appendChild(label);

    card.addEventListener('click', async () => {
      const res = await window.api.selectDefaultSkin(skin.id);
      if (res.success) {
        currentSettings.skinPath = res.skinPath;
        currentSettings.skinDataUrl = res.skinDataUrl;
        currentSettings.skinName = res.skinName;
        updateSkinUI(res.skinDataUrl, res.skinName);
        renderDefaultSkinsGrid();
        renderCustomWardrobeStrip();
      }
    });

    mojangDefaultSkinsGrid.appendChild(card);
  });
}

function renderCustomWardrobeStrip() {
  if (!customWardrobeStrip) return;
  customWardrobeStrip.innerHTML = '';

  if (wardrobeList.length === 0) {
    customWardrobeStrip.innerHTML = `
      <div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">
        В коллекции пока нет своих скинов. Нажмите «+ Загрузить свой .png» слева или скачайте по нику.
      </div>
    `;
    return;
  }

  const activeSkinPath = currentSettings.skinPath;

  wardrobeList.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'skin-thumbnail-card';
    card.style.minWidth = '80px';
    if (item.path === activeSkinPath) card.classList.add('selected');

    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 44;
    canvas.className = 'skin-thumb-canvas';

    const img = new Image();
    img.onload = () => drawAvatarHead(canvas, img);
    img.src = item.dataUrl;

    const label = document.createElement('span');
    label.className = 'skin-thumb-name';
    label.textContent = item.name;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Удалить';
    delBtn.style.cssText = 'background:transparent; border:none; color:var(--text-muted); font-size:10px; cursor:pointer; margin-top:2px;';
    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const res = await window.api.deleteFromWardrobe(item.id);
      if (res.success) {
        wardrobeList = res.wardrobe;
        renderCustomWardrobeStrip();
      }
    });

    card.appendChild(canvas);
    card.appendChild(label);
    card.appendChild(delBtn);

    card.addEventListener('click', async () => {
      const res = await window.api.setActiveWardrobeSkin(item.id);
      if (res.success) {
        currentSettings.skinPath = item.path;
        currentSettings.skinDataUrl = item.dataUrl;
        currentSettings.skinName = item.name;
        updateSkinUI(item.dataUrl, item.name);
        renderDefaultSkinsGrid();
        renderCustomWardrobeStrip();
      }
    });

    customWardrobeStrip.appendChild(card);
  });
}

btnUploadNewSkin?.addEventListener('click', async () => {
  const res = await window.api.addToWardrobe();
  if (res.success && res.skin) {
    wardrobeList = res.wardrobe;
    currentSettings.skinPath = res.skin.path;
    currentSettings.skinDataUrl = res.skin.dataUrl;
    currentSettings.skinName = res.skin.name;
    updateSkinUI(res.skin.dataUrl, res.skin.name);
    renderDefaultSkinsGrid();
    renderCustomWardrobeStrip();
  }
});

btnFetchSkinByNick?.addEventListener('click', async () => {
  const nick = inputFetchSkinNick?.value.trim();
  if (!nick) return;

  btnFetchSkinByNick.disabled = true;
  btnFetchSkinByNick.textContent = 'Поиск...';

  const res = await window.api.fetchSkinByName(nick);
  btnFetchSkinByNick.disabled = false;
  btnFetchSkinByNick.textContent = 'Скачать';

  if (res.success && res.skin) {
    wardrobeList = res.wardrobe;
    currentSettings.skinPath = res.skin.path;
    currentSettings.skinDataUrl = res.skin.dataUrl;
    currentSettings.skinName = res.skin.name;
    updateSkinUI(res.skin.dataUrl, res.skin.name);
    renderDefaultSkinsGrid();
    renderCustomWardrobeStrip();
    if (inputFetchSkinNick) inputFetchSkinNick.value = '';
  } else {
    alert(res.error || 'Скин для этого ника не найден на серверах Ely.by и Mojang.');
  }
});

// --- SERVERS TAB ---
async function loadSavedServers() {
  savedServers = await window.api.getSavedServers();
  renderServersUI();
}

function renderServersUI() {
  if (popularServersGrid) {
    popularServersGrid.innerHTML = '';
    POPULAR_SERVERS.forEach((srv) => {
      const card = document.createElement('div');
      card.className = 'server-card';
      card.innerHTML = `
        <div class="server-card-head">
          <span class="server-name">${srv.name}</span>
          <span class="server-badge-online">Онлайн</span>
        </div>
        <div class="server-desc">${srv.desc}</div>
        <div class="server-ip-line">${srv.address}</div>
        <div class="server-card-actions">
          <button class="btn-srv-act copy" data-copy-addr="${srv.address}">Скопировать IP</button>
          <button class="btn-srv-act join" data-join-addr="${srv.address}">Играть</button>
        </div>
      `;
      popularServersGrid.appendChild(card);
    });

    popularServersGrid.querySelectorAll('button[data-join-addr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const addr = btn.getAttribute('data-join-addr');
        if (inputPlayServer) inputPlayServer.value = addr;
        switchTab('play');
        triggerPlayAction(addr);
      });
    });

    popularServersGrid.querySelectorAll('button[data-copy-addr]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const addr = btn.getAttribute('data-copy-addr');
        await navigator.clipboard.writeText(addr);
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        btn.style.color = '#38bdf8';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
        }, 1500);
      });
    });
  }

  if (realServersList) {
    realServersList.innerHTML = '';
    if (savedServers.length === 0) {
      realServersList.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">
          У вас пока нет добавленных серверов. Добавьте любимый сервер ниже.
        </div>
      `;
    } else {
      savedServers.forEach((srv, idx) => {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.innerHTML = `
          <div class="server-card-head">
            <span class="server-name">${srv.name}</span>
            <span class="server-badge-online">Сохранен</span>
          </div>
          <div class="server-ip-line">${srv.address}</div>
          <div class="server-card-actions">
            <button class="btn-srv-act copy" data-copy-srv="${srv.address}">IP</button>
            <button class="btn-srv-act join" data-custom-play="${srv.address}">Играть</button>
            <button class="btn-srv-act del" data-custom-del="${idx}" title="Удалить">✕</button>
          </div>
        `;
        realServersList.appendChild(card);
      });

      realServersList.querySelectorAll('button[data-custom-play]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const addr = btn.getAttribute('data-custom-play');
          if (inputPlayServer) inputPlayServer.value = addr;
          switchTab('play');
          triggerPlayAction(addr);
        });
      });

      realServersList.querySelectorAll('button[data-copy-srv]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const addr = btn.getAttribute('data-copy-srv');
          await navigator.clipboard.writeText(addr);
          const originalText = btn.textContent;
          btn.textContent = 'Скопировано!';
          btn.style.color = '#38bdf8';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.color = '';
          }, 1500);
        });
      });

      realServersList.querySelectorAll('button[data-custom-del]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.getAttribute('data-custom-del'), 10);
          savedServers.splice(idx, 1);
          await window.api.saveServers(savedServers);
          renderServersUI();
        });
      });
    }
  }
}

btnDirectConnect?.addEventListener('click', () => {
  const addr = inputPlayServer?.value.trim();
  if (addr) {
    switchTab('play');
    triggerPlayAction(addr);
  }
});

btnAddServer?.addEventListener('click', async () => {
  const name = inputNewSrvName?.value.trim();
  const address = inputNewSrvAddr?.value.trim();

  if (!address) {
    alert('Пожалуйста, укажите адрес сервера (IP:порт)');
    return;
  }

  savedServers.push({
    name: name || address,
    address
  });

  await window.api.saveServers(savedServers);
  if (inputNewSrvName) inputNewSrvName.value = '';
  if (inputNewSrvAddr) inputNewSrvAddr.value = '';
  renderServersUI();
});

// --- SETTINGS TAB ---
let saveTimer = null;
function scheduleSaveSettings() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentSettings, 350);
}

async function saveCurrentSettings() {
  const settings = {
    ...currentSettings,
    brandName: 'R-Launcher',
    brandTag: '',
    nickname: inputProfileNickname ? inputProfileNickname.value.trim() || 'Player' : 'Player',
    ramMb: parseInt(settingRamSelect?.value, 10) || 4096,
    preferDiscreteGpu: Boolean(settingGpuToggle?.checked),
    fullscreen: Boolean(settingFullscreenToggle?.checked),
    customArgs: settingCustomArgs?.value.trim() || '',
    savedServers,
  };

  currentSettings = settings;
  await window.api.saveSettings(settings);
}

settingRamSelect?.addEventListener('change', () => scheduleSaveSettings());
settingGpuToggle?.addEventListener('change', () => scheduleSaveSettings());
settingFullscreenToggle?.addEventListener('change', () => scheduleSaveSettings());
settingCustomArgs?.addEventListener('input', () => scheduleSaveSettings());

// Native folder openings
document.querySelectorAll('button[data-open]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const type = btn.getAttribute('data-open');
    if (type) await window.api.openFolder(type);
  });
});

// --- TWO-TIER VERSIONS (MINECRAFT 26.3 & HORIZON 0.2.97 STRICTLY) ---
let selectedMcVersion = '26.3';
let selectedEngineTag = 'v0.2.97';

function getCurrentVersionObj() {
  const activeTag = currentVersionsData.activeVersion || selectedEngineTag;
  return (currentVersionsData.versions || []).find((v) => v.tag === activeTag) || currentVersionsData.versions[0] || null;
}

window.addEventListener('click', (e) => {
  if (!triggerMcVersion?.contains(e.target) && !menuMcVersions?.contains(e.target)) {
    menuMcVersions?.classList.remove('open');
  }
  if (!triggerEngineVersion?.contains(e.target) && !menuEngineVersions?.contains(e.target)) {
    menuEngineVersions?.classList.remove('open');
  }
});

triggerMcVersion?.addEventListener('click', (e) => {
  e.stopPropagation();
  menuEngineVersions?.classList.remove('open');
  menuMcVersions?.classList.toggle('open');
});

triggerEngineVersion?.addEventListener('click', (e) => {
  e.stopPropagation();
  menuMcVersions?.classList.remove('open');
  menuEngineVersions?.classList.toggle('open');
});

async function refreshVersions() {
  try {
    currentVersionsData = await window.api.getVersions();
  } catch (err) {
    console.error('getVersions error:', err);
  }

  selectedMcVersion = '26.3';
  selectedEngineTag = 'v0.2.97';

  renderMcVersionDropdown();
  renderEngineVersionDropdown();
  updateDockForVersion(getCurrentVersionObj());
}

function renderMcVersionDropdown() {
  if (!menuMcVersions) return;
  menuMcVersions.innerHTML = '';

  if (selectedMcVersionLabel) {
    selectedMcVersionLabel.textContent = `Minecraft 26.3`;
  }

  const item = document.createElement('div');
  item.className = 'select-item type-stable active';
  item.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:2px;">
      <span style="font-weight:700;">Minecraft 26.3</span>
      <span style="font-size:10px; color:var(--text-muted);">Официальная версия Horizon</span>
    </div>
  `;
  item.addEventListener('click', () => {
    menuMcVersions.classList.remove('open');
  });
  menuMcVersions.appendChild(item);
}

function renderEngineVersionDropdown() {
  if (!menuEngineVersions) return;
  menuEngineVersions.innerHTML = '';

  if (selectedEngineVersionLabel) {
    selectedEngineVersionLabel.textContent = `Horizon 0.2.97`;
  }

  const ver = getCurrentVersionObj();
  const item = document.createElement('div');
  item.className = 'select-item type-stable active';
  item.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:2px;">
      <span style="font-size:12px; font-weight:700;">Horizon 0.2.97</span>
      <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">v0.2.97 · Stable</span>
    </div>
    <div style="display:flex; align-items:center; gap:6px;">
      <span style="font-size:9px; font-weight:800; color:#10b981; background:rgba(0,0,0,0.3); padding:2px 5px; border-radius:4px;">
        STABLE
      </span>
      ${ver && ver.isInstalled ? '<span style="font-size:11px; color:#10b981;" title="Установлена">✓</span>' : ''}
    </div>
  `;
  item.addEventListener('click', () => {
    menuEngineVersions.classList.remove('open');
  });
  menuEngineVersions.appendChild(item);
}

function updateDockForVersion(ver) {
  if (!btnHeroAction) return;

  btnHeroAction.classList.remove('running-mode', 'download-mode');

  if (isRunning) {
    btnHeroAction.classList.add('running-mode');
    heroBtnText.textContent = 'ЗАКРЫТЬ ИГРУ';
    heroBtnIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>';
    return;
  }

  btnHeroAction.disabled = false;

  if (ver && ver.isInstalled) {
    heroBtnText.textContent = 'ИГРАТЬ';
    heroBtnIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    btnHeroAction.classList.add('download-mode');
    heroBtnText.textContent = 'СКАЧАТЬ';
    heroBtnIcon.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>';
  }
}

// Download execution
async function startVersionDownload(tag) {
  if (isDownloading) return;
  isDownloading = true;

  if (downloadProgressStrip) downloadProgressStrip.style.display = 'block';
  if (downloadStripStatus) downloadStripStatus.textContent = `Загрузка ${tag} с официального сервера...`;
  if (downloadStripPercent) downloadStripPercent.textContent = '0%';
  if (downloadStripFill) downloadStripFill.style.width = '0%';

  if (btnHeroAction) {
    btnHeroAction.disabled = true;
    heroBtnText.textContent = 'ЗАГРУЗКА...';
  }

  const res = await window.api.downloadVersion(tag);
  isDownloading = false;
  if (btnHeroAction) btnHeroAction.disabled = false;

  if (res.success) {
    if (downloadStripStatus) downloadStripStatus.textContent = 'Установка завершена!';
    if (downloadStripPercent) downloadStripPercent.textContent = '100%';
    if (downloadStripFill) downloadStripFill.style.width = '100%';

    setTimeout(() => {
      if (downloadProgressStrip) downloadProgressStrip.style.display = 'none';
    }, 1500);

    await window.api.setVersion(tag, '26.3');
    await refreshVersions();
  } else {
    alert(`Ошибка загрузки версии: ${res.error}`);
    if (downloadProgressStrip) downloadProgressStrip.style.display = 'none';
    await refreshVersions();
  }
}

window.api.onVersionProgress((data) => {
  if (downloadStripStatus) downloadStripStatus.textContent = data.status || 'Загрузка ресурсов...';
  if (downloadStripPercent) downloadStripPercent.textContent = `${data.percent}%`;
  if (downloadStripFill) downloadStripFill.style.width = `${data.percent}%`;
});

// Big Action Button Click
btnHeroAction?.addEventListener('click', () => {
  triggerPlayAction(null);
});

async function triggerPlayAction(targetServer = null) {
  const activeTag = 'v0.2.97';
  const ver = getCurrentVersionObj();

  if (isRunning) {
    await window.api.killGame();
    return;
  }

  if (!ver || !ver.isInstalled) {
    await startVersionDownload(activeTag);
    return;
  }

  await launchGame(targetServer);
}

async function launchGame(targetServer = null) {
  if (isRunning) return;
  isRunning = true;
  updateDockForVersion(getCurrentVersionObj());

  const res = await window.api.launchGame(targetServer);
  if (!res.success) {
    isRunning = false;
    alert(`Ошибка запуска Minecraft: ${res.error}`);
    updateDockForVersion(getCurrentVersionObj());
  }
}

window.api.onGameExit((code) => {
  isRunning = false;
  updateDockForVersion(getCurrentVersionObj());
});

// --- MODPACK & ASSEMBLY MANAGER ---
function getModpacks() {
  if (currentSettings.modpacks && Array.isArray(currentSettings.modpacks)) {
    return currentSettings.modpacks;
  }
  return [
    {
      id: 'vanilla',
      name: 'Ванилла',
      version: '26.3',
      isDefault: true,
      description: 'Чистый официальный клиент Horizon 0.2.97',
      mods: [],
      texturepacks: [],
      shaders: []
    },
    {
      id: 'pvp-boost',
      name: 'PVP & Оптимизация',
      version: '26.3',
      isDefault: false,
      description: 'Оптимизация рендера, высокий FPS и шейдеры',
      mods: ['Sodium', 'Iris Shaders', 'FastCraft Pro'],
      texturepacks: ['Faithful 32x'],
      shaders: ['Complementary Reimagined']
    }
  ];
}

function getActiveModpack() {
  const packs = getModpacks();
  const activeId = currentSettings.activeModpackId || 'vanilla';
  return packs.find((p) => p.id === activeId) || packs[0];
}

function updateDockModpackUI() {
  const pack = getActiveModpack();
  if (dockModpackName) {
    dockModpackName.textContent = pack ? pack.name : 'Ванилла';
  }
}

// Open / Close Modpacks Modal
triggerModpackManager?.addEventListener('click', () => {
  modalModpacks?.classList.add('open');
  showModpackSubView('list');
  renderModpacksList();
});

btnCloseModpacksModal?.addEventListener('click', () => {
  modalModpacks?.classList.remove('open');
});

modalModpacks?.addEventListener('click', (e) => {
  if (e.target === modalModpacks) {
    modalModpacks.classList.remove('open');
  }
});

// Subtabs inside modal: "Мои сборки" vs "Каталог"
tabBtnModpackList?.addEventListener('click', () => {
  tabBtnModpackList.classList.add('active');
  tabBtnModpackCatalog.classList.remove('active');
  showModpackSubView('list');
  renderModpacksList();
});

tabBtnModpackCatalog?.addEventListener('click', () => {
  tabBtnModpackCatalog.classList.add('active');
  tabBtnModpackList.classList.remove('active');
  showModpackSubView('catalog');
  renderCatalogGrid();
});

function showModpackSubView(viewName) {
  if (viewModpackList) viewModpackList.style.display = viewName === 'list' ? 'block' : 'none';
  if (viewModpackCreate) viewModpackCreate.style.display = viewName === 'create' ? 'block' : 'none';
  if (viewModpackCatalog) viewModpackCatalog.style.display = viewName === 'catalog' ? 'block' : 'none';
}

// Render assemblies list
function renderModpacksList() {
  if (!modpackCardsContainer) return;
  modpackCardsContainer.innerHTML = '';

  const packs = getModpacks();
  const activePack = getActiveModpack();

  packs.forEach((pack) => {
    const card = document.createElement('div');
    const isActive = activePack && activePack.id === pack.id;
    card.className = `modpack-card ${isActive ? 'active-pack' : ''}`;

    const modsCount = (pack.mods || []).length;
    const texCount = (pack.texturepacks || []).length;
    const shaCount = (pack.shaders || []).length;

    card.innerHTML = `
      <div class="modpack-card-header">
        <span class="modpack-card-title">${pack.name}</span>
        <span class="modpack-card-badge">${pack.isDefault ? 'СТАНДАРТ' : 'КАСТОМ'}</span>
      </div>
      <div class="modpack-card-desc">${pack.description || 'Пользовательская сборка игрока'}</div>
      <div class="modpack-card-meta">
        <span>📦 ${modsCount} мод.</span>
        <span>🎨 ${texCount} тест.</span>
        <span>☀️ ${shaCount} шейд.</span>
      </div>
      <div class="modpack-card-actions">
        <button class="btn-action-primary" style="padding: 6px 14px; font-size: 11px;" data-select-pack="${pack.id}">
          ${isActive ? '✓ Активна' : 'Выбрать'}
        </button>
        ${
          !pack.isDefault
            ? `<button class="btn-srv-act del" style="font-size: 11px;" data-delete-pack="${pack.id}">Удалить</button>`
            : ''
        }
      </div>
    `;

    card.querySelector('button[data-select-pack]').addEventListener('click', async () => {
      currentSettings.activeModpackId = pack.id;
      await window.api.saveSettings(currentSettings);
      updateDockModpackUI();
      renderModpacksList();
    });

    const delBtn = card.querySelector('button[data-delete-pack]');
    if (delBtn) {
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Удалить сборку «${pack.name}»?`)) {
          currentSettings.modpacks = currentSettings.modpacks.filter((p) => p.id !== pack.id);
          if (currentSettings.activeModpackId === pack.id) {
            currentSettings.activeModpackId = 'vanilla';
          }
          await window.api.saveSettings(currentSettings);
          updateDockModpackUI();
          renderModpacksList();
        }
      });
    }

    modpackCardsContainer.appendChild(card);
  });
}

// Create new assembly button
btnOpenCreateModpack?.addEventListener('click', () => {
  newPackData = {
    name: '',
    version: '26.3',
    mods: [],
    texturepacks: [],
    shaders: []
  };
  if (inputNewPackName) inputNewPackName.value = '';
  updateCreatePackChips();
  showModpackSubView('create');
});

btnBackFromCreate?.addEventListener('click', () => showModpackSubView('list'));
btnCancelCreatePack?.addEventListener('click', () => showModpackSubView('list'));

function updateCreatePackChips() {
  if (badgeCountMods) badgeCountMods.textContent = String(newPackData.mods.length);
  if (badgeCountTextures) badgeCountTextures.textContent = String(newPackData.texturepacks.length);
  if (badgeCountShaders) badgeCountShaders.textContent = String(newPackData.shaders.length);

  renderChipsList(chipsPackMods, newPackData.mods, (idx) => {
    newPackData.mods.splice(idx, 1);
    updateCreatePackChips();
  });

  renderChipsList(chipsPackTextures, newPackData.texturepacks, (idx) => {
    newPackData.texturepacks.splice(idx, 1);
    updateCreatePackChips();
  });

  renderChipsList(chipsPackShaders, newPackData.shaders, (idx) => {
    newPackData.shaders.splice(idx, 1);
    updateCreatePackChips();
  });
}

function renderChipsList(container, arr, onRemove) {
  if (!container) return;
  container.innerHTML = '';
  arr.forEach((name, idx) => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.innerHTML = `
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
      <span class="chip-del" title="Убрать">✕</span>
    `;
    chip.querySelector('.chip-del').addEventListener('click', () => onRemove(idx));
    container.appendChild(chip);
  });
}

// Add files directly from PC (.jar / .zip)
btnFileMods?.addEventListener('click', async () => {
  const file = await window.api.selectFile({
    title: 'Выберите файл мода (.jar / .hmod)',
    filters: [{ name: 'Minecraft Mods', extensions: ['jar', 'hmod', 'zip'] }]
  });
  if (file) {
    const filename = file.split(/[\\/]/).pop();
    newPackData.mods.push(filename);
    updateCreatePackChips();
  }
});

btnFileTextures?.addEventListener('click', async () => {
  const file = await window.api.selectFile({
    title: 'Выберите текстурпак (.zip)',
    filters: [{ name: 'Texture Packs', extensions: ['zip'] }]
  });
  if (file) {
    const filename = file.split(/[\\/]/).pop();
    newPackData.texturepacks.push(filename);
    updateCreatePackChips();
  }
});

btnFileShaders?.addEventListener('click', async () => {
  const file = await window.api.selectFile({
    title: 'Выберите шейдерпак (.zip)',
    filters: [{ name: 'Shaders', extensions: ['zip'] }]
  });
  if (file) {
    const filename = file.split(/[\\/]/).pop();
    newPackData.shaders.push(filename);
    updateCreatePackChips();
  }
});

// Add from catalog shortcuts
btnPickModsCat?.addEventListener('click', () => {
  activeCatalogCategory = 'mods';
  tabBtnModpackCatalog?.click();
});
btnPickTexCat?.addEventListener('click', () => {
  activeCatalogCategory = 'textures';
  tabBtnModpackCatalog?.click();
});
btnPickShaCat?.addEventListener('click', () => {
  activeCatalogCategory = 'shaders';
  tabBtnModpackCatalog?.click();
});

// Save new Modpack
btnSaveNewPack?.addEventListener('click', async () => {
  const name = inputNewPackName?.value.trim() || 'Моя сборка';
  const newId = `pack-${Date.now()}`;

  const newPack = {
    id: newId,
    name,
    version: '26.3',
    isDefault: false,
    description: `Сборка Minecraft 26.3 (${newPackData.mods.length} модов, ${newPackData.texturepacks.length} текстурпаков)`,
    mods: [...newPackData.mods],
    texturepacks: [...newPackData.texturepacks],
    shaders: [...newPackData.shaders]
  };

  if (!currentSettings.modpacks) currentSettings.modpacks = getModpacks();
  currentSettings.modpacks.push(newPack);
  currentSettings.activeModpackId = newId;

  await window.api.saveSettings(currentSettings);
  updateDockModpackUI();
  showModpackSubView('list');
  renderModpacksList();
});

// Catalog Rendering
function renderCatalogGrid() {
  if (!catalogItemsGrid) return;
  catalogItemsGrid.innerHTML = '';

  const search = (inputCatalogSearch?.value || '').toLowerCase().trim();

  // Highlight category filter buttons
  catalogCategoryFilter?.querySelectorAll('button[data-cat]').forEach((b) => {
    if (b.getAttribute('data-cat') === activeCatalogCategory) {
      b.classList.add('active-cat');
    } else {
      b.classList.remove('active-cat');
    }
  });

  const filtered = CATALOG_ITEMS.filter((item) => {
    const matchesCat = item.category === activeCatalogCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search) || item.desc.toLowerCase().includes(search);
    return matchesCat && matchesSearch;
  });

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'catalog-card';
    card.innerHTML = `
      <div class="catalog-header">
        <span class="catalog-title">${item.name}</span>
        <span class="catalog-author">${item.downloads}</span>
      </div>
      <div class="catalog-desc">${item.desc}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
        <span style="font-size:10px; color:var(--text-muted);">Автор: ${item.author}</span>
        <button class="btn-action-primary" style="padding: 4px 10px; font-size: 11px;" data-add-catalog="${item.id}">
          + Добавить в сборку
        </button>
      </div>
    `;

    card.querySelector('button[data-add-catalog]').addEventListener('click', () => {
      if (item.category === 'mods') {
        newPackData.mods.push(item.name);
      } else if (item.category === 'textures') {
        newPackData.texturepacks.push(item.name);
      } else if (item.category === 'shaders') {
        newPackData.shaders.push(item.name);
      }
      updateCreatePackChips();

      // Switch back to create tab or notify
      showModpackSubView('create');
      tabBtnModpackList?.click();
    });

    catalogItemsGrid.appendChild(card);
  });
}

catalogCategoryFilter?.querySelectorAll('button[data-cat]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeCatalogCategory = btn.getAttribute('data-cat');
    renderCatalogGrid();
  });
});

inputCatalogSearch?.addEventListener('input', () => {
  renderCatalogGrid();
});

// --- FRIENDS & INVITE CODE SYSTEM (HORIZON FRIENDS P2P) ---
let friendsList = [];
let myInviteCode = 'hzn://offline';

const inputFriendInviteCode = document.getElementById('input-friend-invite-code');
const btnJoinFriendCode = document.getElementById('btn-join-friend-code');
const displayMyInviteCode = document.getElementById('display-my-invite-code');
const btnCopyMyCode = document.getElementById('btn-copy-my-code');
const btnRefreshMyCode = document.getElementById('btn-refresh-my-code');
const btnOpenAddFriend = document.getElementById('btn-open-add-friend');
const friendsListContainer = document.getElementById('friends-list-container');

async function renderFriendsUI() {
  try {
    friendsList = await window.api.getFriends();
  } catch (_) {
    friendsList = [];
  }

  if (myInviteCode === 'hzn://offline') {
    try {
      myInviteCode = await window.api.generateInviteCode();
      if (displayMyInviteCode) displayMyInviteCode.textContent = myInviteCode;
    } catch (_) {}
  }

  if (!friendsListContainer) return;
  friendsListContainer.innerHTML = '';

  if (friendsList.length === 0) {
    friendsListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 13px;">
        Список друзей пуст. Добавьте друзей по никнейму или поделитесь кодом приглашения!
      </div>
    `;
    return;
  }

  friendsList.forEach((friend) => {
    const card = document.createElement('div');
    card.className = 'setting-card';
    card.style.padding = '10px 14px';
    card.style.background = 'rgba(255, 255, 255, 0.03)';
    card.style.border = '1px solid var(--border-subtle)';
    card.style.borderRadius = '8px';

    const statusDot = friend.status === 'online' ? '#22c55e' : (friend.status === 'lobby' ? '#eab308' : '#64748b');
    const statusText = friend.status === 'online' ? 'В игре' : (friend.status === 'lobby' ? 'В лобби' : 'Не в сети');

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: #f97316;">
          ${(friend.nickname || 'F').substring(0, 2).toUpperCase()}
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; font-size: 13px; color: #ffffff;">${escapeHtml(friend.nickname)}</span>
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusDot};"></span>
            <span style="font-size: 10px; color: ${statusDot}; font-weight: 600;">${statusText}</span>
          </div>
          <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(friend.activity || '')}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${friend.worldCode ? `
          <button class="btn-action-primary btn-join-world" data-code="${friend.worldCode}" style="height: 28px; padding: 0 10px; font-size: 11px;">
            Войти в мир
          </button>
        ` : (friend.status !== 'offline' ? `
          <button class="btn-action-secondary btn-invite-friend" data-id="${friend.id}" style="height: 28px; padding: 0 10px; font-size: 11px;">
            Пригласить
          </button>
        ` : '')}
        <button class="win-btn btn-remove-friend" data-id="${friend.id}" title="Удалить" style="width: 28px; height: 28px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-join-world')?.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      if (code) {
        showCustomAlert('Подключение к миру', `Подключение к сессии друга через P2P (${code})...`);
        window.api.launchGame(code);
      }
    });

    card.querySelector('.btn-invite-friend')?.addEventListener('click', () => {
      showCustomAlert('Приглашение отправлено', `Приглашение в игру отправлено игроку ${friend.nickname}!`);
    });

    card.querySelector('.btn-remove-friend')?.addEventListener('click', async (e) => {
      const fid = e.currentTarget.getAttribute('data-id');
      friendsList = friendsList.filter(f => f.id !== fid);
      await window.api.saveFriends(friendsList);
      renderFriendsUI();
    });

    friendsListContainer.appendChild(card);
  });
}

btnJoinFriendCode?.addEventListener('click', () => {
  const code = (inputFriendInviteCode?.value || '').trim();
  if (!code) {
    showCustomAlert('Ошибка', 'Введите инвайт-код друга!');
    return;
  }
  showCustomAlert('Подключение', `Подключение к сессии ${code}...`);
  window.api.launchGame(code);
});

btnCopyMyCode?.addEventListener('click', () => {
  if (myInviteCode) {
    navigator.clipboard.writeText(myInviteCode);
    btnCopyMyCode.textContent = 'Скопировано!';
    setTimeout(() => { if (btnCopyMyCode) btnCopyMyCode.textContent = 'Скопировать'; }, 2000);
  }
});

btnRefreshMyCode?.addEventListener('click', async () => {
  myInviteCode = await window.api.generateInviteCode();
  if (displayMyInviteCode) displayMyInviteCode.textContent = myInviteCode;
});

btnOpenAddFriend?.addEventListener('click', async () => {
  const nick = prompt('Введите никнейм друга:');
  if (nick && nick.trim()) {
    friendsList.push({
      id: 'f_' + Date.now(),
      nickname: nick.trim(),
      status: 'online',
      activity: 'В главном меню',
      ping: 45,
      worldCode: null
    });
    await window.api.saveFriends(friendsList);
    renderFriendsUI();
  }
});

// --- PERSISTENT MOBILE TOUCH CONTROLS CONFIGURATION UI ---
const settingTouchEnable = document.getElementById('setting-touch-enable');
const settingTouchStickMode = document.getElementById('setting-touch-stick-mode');
const settingTouchSneakDouble = document.getElementById('setting-touch-sneak-double');
const settingTouchSprintHold = document.getElementById('setting-touch-sprint-hold');
const settingTouchOpacity = document.getElementById('setting-touch-opacity');
const valTouchOpacity = document.getElementById('val-touch-opacity');
const settingTouchScale = document.getElementById('setting-touch-scale');
const valTouchScale = document.getElementById('val-touch-scale');
const settingTouchSens = document.getElementById('setting-touch-sens');
const valTouchSens = document.getElementById('val-touch-sens');
const settingTouchLefty = document.getElementById('setting-touch-lefty');
const settingTouchSound = document.getElementById('setting-touch-sound');
const settingTouchSplit = document.getElementById('setting-touch-split');
const settingTouchMine = document.getElementById('setting-touch-mine');
const valTouchMine = document.getElementById('val-touch-mine');
const btnSaveTouchSettings = document.getElementById('btn-save-touch-settings');

async function loadTouchSettingsUI() {
  try {
    const s = await window.api.getTouchSettings();
    if (settingTouchEnable) settingTouchEnable.checked = s.enabled !== false;
    if (settingTouchStickMode) settingTouchStickMode.value = s.stick_mode || 'floating';
    if (settingTouchSneakDouble) settingTouchSneakDouble.checked = s.sneak_double_tap !== false;
    if (settingTouchSprintHold) settingTouchSprintHold.checked = s.sprint_hold_forward !== false;
    
    if (settingTouchOpacity) {
      const op = Math.round((s.opacity || 0.8) * 100);
      settingTouchOpacity.value = op;
      if (valTouchOpacity) valTouchOpacity.textContent = `${op}%`;
    }
    
    if (settingTouchScale) {
      const sc = Math.round((s.button_scale || 1.0) * 100);
      settingTouchScale.value = sc;
      if (valTouchScale) valTouchScale.textContent = `${(sc / 100).toFixed(1)}x`;
    }

    if (settingTouchSens) {
      const se = Math.round((s.touch_camera_sensitivity || 1.0) * 100);
      settingTouchSens.value = se;
      if (valTouchSens) valTouchSens.textContent = `${(se / 100).toFixed(1)}x`;
    }

    if (settingTouchLefty) settingTouchLefty.checked = Boolean(s.left_handed);
    if (settingTouchSound) settingTouchSound.checked = s.sound_feedback !== false;
    if (settingTouchSplit) settingTouchSplit.checked = s.split_controls !== false;

    if (settingTouchMine) {
      settingTouchMine.value = s.hold_mine_ms || 350;
      if (valTouchMine) valTouchMine.textContent = `${s.hold_mine_ms || 350} мс`;
    }
  } catch (err) {
    console.error('Failed loading touch settings UI:', err);
  }
}

settingTouchOpacity?.addEventListener('input', (e) => {
  if (valTouchOpacity) valTouchOpacity.textContent = `${e.target.value}%`;
});

settingTouchScale?.addEventListener('input', (e) => {
  if (valTouchScale) valTouchScale.textContent = `${(Number(e.target.value) / 100).toFixed(1)}x`;
});

settingTouchSens?.addEventListener('input', (e) => {
  if (valTouchSens) valTouchSens.textContent = `${(Number(e.target.value) / 100).toFixed(1)}x`;
});

settingTouchMine?.addEventListener('input', (e) => {
  if (valTouchMine) valTouchMine.textContent = `${e.target.value} мс`;
});

// --- TOUCH PRESET SWITCHER ---
document.querySelectorAll('.btn-touch-preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    playUiClickSound();
    const preset = btn.getAttribute('data-preset');
    if (preset === 'bedrock') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'fixed';
      if (settingTouchScale) settingTouchScale.value = 100;
      if (valTouchScale) valTouchScale.textContent = '1.0x';
      if (settingTouchOpacity) settingTouchOpacity.value = 80;
      if (valTouchOpacity) valTouchOpacity.textContent = '80%';
      if (settingTouchSens) settingTouchSens.value = 100;
      if (valTouchSens) valTouchSens.textContent = '1.0x';
      if (settingTouchMine) settingTouchMine.value = 350;
      if (valTouchMine) valTouchMine.textContent = '350 мс';
      if (settingTouchLefty) settingTouchLefty.checked = false;
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Классика Bedrock';
    } else if (preset === 'claw') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'floating';
      if (settingTouchScale) settingTouchScale.value = 115;
      if (valTouchScale) valTouchScale.textContent = '1.2x';
      if (settingTouchOpacity) settingTouchOpacity.value = 65;
      if (valTouchOpacity) valTouchOpacity.textContent = '65%';
      if (settingTouchSens) settingTouchSens.value = 140;
      if (valTouchSens) valTouchSens.textContent = '1.4x';
      if (settingTouchMine) settingTouchMine.value = 250;
      if (valTouchMine) valTouchMine.textContent = '250 мс';
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Клешня (PvP 3-4 пальца)';
    } else if (preset === 'tablet') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'floating';
      if (settingTouchScale) settingTouchScale.value = 135;
      if (valTouchScale) valTouchScale.textContent = '1.4x';
      if (settingTouchOpacity) settingTouchOpacity.value = 85;
      if (valTouchOpacity) valTouchOpacity.textContent = '85%';
      if (settingTouchSens) settingTouchSens.value = 90;
      if (valTouchSens) valTouchSens.textContent = '0.9x';
      if (settingTouchMine) settingTouchMine.value = 350;
      if (valTouchMine) valTouchMine.textContent = '350 мс';
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Планшет / Большой экран';
    }
  });
});

btnSaveTouchSettings?.addEventListener('click', async () => {
  const updated = {
    enabled: Boolean(settingTouchEnable?.checked),
    stick_mode: settingTouchStickMode?.value || 'floating',
    sneak_double_tap: Boolean(settingTouchSneakDouble?.checked),
    sprint_hold_forward: Boolean(settingTouchSprintHold?.checked),
    opacity: Number(settingTouchOpacity?.value || 80) / 100,
    button_scale: Number(settingTouchScale?.value || 100) / 100,
    touch_camera_sensitivity: Number(settingTouchSens?.value || 100) / 100,
    left_handed: Boolean(settingTouchLefty?.checked),
    sound_feedback: Boolean(settingTouchSound?.checked),
    split_controls: Boolean(settingTouchSplit?.checked),
    hold_mine_ms: Number(settingTouchMine?.value || 350)
  };

  const ok = await window.api.saveTouchSettings(updated);
  if (ok) {
    btnSaveTouchSettings.textContent = 'Сохранено!';
    setTimeout(() => { if (btnSaveTouchSettings) btnSaveTouchSettings.textContent = 'Сохранить настройки'; }, 2000);
    showCustomAlert('Профиль сохранен', 'Настройки сенсорного управления успешно записаны в .horizon-mod-data/mobile_touch_controls/settings.json!');
  } else {
    showCustomAlert('Ошибка', 'Не удалось сохранить настройки сенсорного управления');
  }
});

// --- AUDIO FEEDBACK SYNTHESIZER ---
let audioCtx = null;
function playUiClickSound() {
  if (settingTouchSound && !settingTouchSound.checked) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (_) {}
}

// --- TOUCH HUD SIMULATOR PREVIEW ---
const simCanvas = document.getElementById('touch-hud-sim-canvas');
const simFeedback = document.getElementById('touch-sim-feedback');
let simCtx = simCanvas?.getContext('2d');
let simStickPos = { x: 70, y: 140 };
let simStickKnob = { x: 70, y: 140 };
let simIsDraggingStick = false;
let simIsSneaking = false;
let simIsSprinting = false;
let simLastCenterClick = 0;
let simHoldingRight = false;
let simHoldStartTime = 0;
let simMiningProgress = 0;
let simRightClickPos = { x: 0, y: 0 };
let simJumpDown = false;
let simZoomDown = false;

function drawSimHud() {
  if (!simCanvas || !simCtx) return;
  const w = simCanvas.width;
  const h = simCanvas.height;
  simCtx.clearRect(0, 0, w, h);

  // Background environment simulation (Minecraft landscape silhouette)
  const grad = simCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0a0e17');
  grad.addColorStop(0.7, '#151c28');
  grad.addColorStop(1, '#0c221a');
  simCtx.fillStyle = grad;
  simCtx.fillRect(0, 0, w, h);

  // Grid / Crosshair
  simCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  simCtx.beginPath();
  simCtx.moveTo(w / 2, 0); simCtx.lineTo(w / 2, h);
  simCtx.stroke();

  // Minecraft crosshair (Split Controls)
  if (settingTouchSplit?.checked !== false) {
    simCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    simCtx.lineWidth = 2;
    simCtx.beginPath();
    simCtx.moveTo(w / 2 - 6, h / 2); simCtx.lineTo(w / 2 + 6, h / 2);
    simCtx.moveTo(w / 2, h / 2 - 6); simCtx.lineTo(w / 2, h / 2 + 6);
    simCtx.stroke();
  }

  const opacity = Number(settingTouchOpacity?.value || 80) / 100;
  const scale = Number(settingTouchScale?.value || 100) / 100;
  const lefty = Boolean(settingTouchLefty?.checked);

  // Base colors with opacity
  const baseFill = `rgba(30, 41, 59, ${opacity * 0.8})`;
  const baseStroke = `rgba(148, 163, 184, ${opacity})`;

  // 1. Joystick
  const stickR = 40 * scale;
  const knobR = 16 * scale;
  const centerStickX = lefty ? (w - 70 * scale) : (70 * scale);
  const centerStickY = h - 60 * scale;

  const currentCenter = (settingTouchStickMode?.value === 'floating' && simIsDraggingStick) ? simStickPos : { x: centerStickX, y: centerStickY };

  simCtx.beginPath();
  simCtx.arc(currentCenter.x, currentCenter.y, stickR, 0, Math.PI * 2);
  simCtx.fillStyle = baseFill;
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.lineWidth = 2;
  simCtx.stroke();

  // Center sneak dot
  simCtx.beginPath();
  simCtx.arc(currentCenter.x, currentCenter.y, 4, 0, Math.PI * 2);
  simCtx.fillStyle = simIsSneaking ? '#22c55e' : 'rgba(255,255,255,0.4)';
  simCtx.fill();

  // Displaced knob
  simCtx.beginPath();
  simCtx.arc(simStickKnob.x, simStickKnob.y, knobR, 0, Math.PI * 2);
  simCtx.fillStyle = simIsSprinting ? 'rgba(59, 130, 246, 0.9)' : (simIsSneaking ? 'rgba(34, 197, 94, 0.9)' : `rgba(249, 115, 22, ${opacity})`);
  simCtx.fill();
  simCtx.strokeStyle = '#ffffff';
  simCtx.lineWidth = 1.5;
  simCtx.stroke();

  // 2. Jump Button
  const jumpSize = 38 * scale;
  const jumpX = lefty ? (20 * scale) : (w - 55 * scale);
  const jumpY = h - 55 * scale;

  simCtx.fillStyle = simJumpDown ? 'rgba(34, 197, 94, 0.85)' : baseFill;
  simCtx.beginPath();
  simCtx.roundRect(jumpX, jumpY, jumpSize, jumpSize, 8);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();

  simCtx.fillStyle = '#ffffff';
  simCtx.font = `bold ${Math.round(10 * scale)}px sans-serif`;
  simCtx.textAlign = 'center';
  simCtx.textBaseline = 'middle';
  simCtx.fillText('JUMP', jumpX + jumpSize / 2, jumpY + jumpSize / 2);

  // 3. Sneak Standalone Button
  const sneakSize = 32 * scale;
  const sneakX = lefty ? (jumpX + jumpSize + 8) : (jumpX - sneakSize - 8);
  const sneakY = jumpY + (jumpSize - sneakSize) / 2;

  simCtx.fillStyle = simIsSneaking ? 'rgba(34, 197, 94, 0.85)' : baseFill;
  simCtx.beginPath();
  simCtx.roundRect(sneakX, sneakY, sneakSize, sneakSize, 6);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();
  simCtx.fillStyle = '#ffffff';
  simCtx.fillText('SHIFT', sneakX + sneakSize / 2, sneakY + sneakSize / 2);

  // 4. Zoom Button (Above Jump)
  const zoomSize = 32 * scale;
  const zoomX = jumpX + (jumpSize - zoomSize) / 2;
  const zoomY = jumpY - zoomSize - 8;

  simCtx.fillStyle = simZoomDown ? 'rgba(59, 130, 246, 0.85)' : baseFill;
  simCtx.beginPath();
  simCtx.roundRect(zoomX, zoomY, zoomSize, zoomSize, 6);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();
  simCtx.fillStyle = '#ffffff';
  simCtx.fillText('ZOOM', zoomX + zoomSize / 2, zoomY + zoomSize / 2);

  // 5. Drop Item Button (Above Sneak)
  const dropSize = 32 * scale;
  const dropX = sneakX;
  const dropY = zoomY;

  simCtx.fillStyle = baseFill;
  simCtx.beginPath();
  simCtx.roundRect(dropX, dropY, dropSize, dropSize, 6);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();
  simCtx.fillStyle = '#ffffff';
  simCtx.fillText('DROP', dropX + dropSize / 2, dropY + dropSize / 2);

  // 6. Pause button at top
  simCtx.fillStyle = baseFill;
  simCtx.beginPath();
  simCtx.roundRect(w / 2 - 16, 8, 32, 20, 4);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();
  simCtx.fillStyle = '#ffffff';
  simCtx.fillText('II', w / 2, 18);

  // 5. Hotbar Slots Preview at bottom
  const hotbarW = 160 * scale;
  const hotbarH = 18 * scale;
  const hotbarX = (w - hotbarW) / 2;
  const hotbarY = h - hotbarH - 4;
  simCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  simCtx.fillRect(hotbarX, hotbarY, hotbarW, hotbarH);
  simCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  simCtx.strokeRect(hotbarX, hotbarY, hotbarW, hotbarH);

  const slotW = hotbarW / 9;
  for (let i = 0; i < 9; i++) {
    simCtx.strokeRect(hotbarX + i * slotW, hotbarY, slotW, hotbarH);
  }

  // 6. Mining circular indicator if holding right side
  if (simHoldingRight && simMiningProgress > 0) {
    simCtx.beginPath();
    simCtx.arc(simRightClickPos.x, simRightClickPos.y, 14, 0, Math.PI * 2 * simMiningProgress);
    simCtx.strokeStyle = '#ef4444';
    simCtx.lineWidth = 3;
    simCtx.stroke();
  }

  requestAnimationFrame(drawSimHud);
}

if (simCanvas) {
  simCanvas.addEventListener('mousedown', (e) => {
    const rect = simCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (simCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (simCanvas.height / rect.height);
    const lefty = Boolean(settingTouchLefty?.checked);
    const scale = Number(settingTouchScale?.value || 100) / 100;
    const isMoveSide = lefty ? (x >= simCanvas.width / 2) : (x < simCanvas.width / 2);

    if (isMoveSide) {
      simIsDraggingStick = true;
      if (settingTouchStickMode?.value === 'floating') {
        simStickPos = { x, y };
      }
      simStickKnob = { x, y };

      // Double-click check on stick center for sneak
      const now = Date.now();
      if (now - simLastCenterClick < 320) {
        simIsSneaking = !simIsSneaking;
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = simIsSneaking ? 'Скрытность: ВКЛ (Shift)' : 'Скрытность: ВЫКЛ';
      }
      simLastCenterClick = now;
    } else {
      // Check buttons
      const jumpSize = 38 * scale;
      const jumpX = lefty ? (20 * scale) : (simCanvas.width - 55 * scale);
      const jumpY = simCanvas.height - 55 * scale;
      if (x >= jumpX && x <= jumpX + jumpSize && y >= jumpY && y <= jumpY + jumpSize) {
        simJumpDown = true;
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = 'Действие: ПРЫЖОК (Пробел)';
        return;
      }

      // Check sneak standalone button
      const sneakSize = 32 * scale;
      const sneakX = lefty ? (jumpX + jumpSize + 8) : (jumpX - sneakSize - 8);
      const sneakY = jumpY + (jumpSize - sneakSize) / 2;
      if (x >= sneakX && x <= sneakX + sneakSize && y >= sneakY && y <= sneakY + sneakSize) {
        simIsSneaking = !simIsSneaking;
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = simIsSneaking ? 'Скрытность: ВКЛ (Shift)' : 'Скрытность: ВЫКЛ';
        return;
      }

      // Check zoom button
      const zoomSize = 32 * scale;
      const zoomX = jumpX + (jumpSize - zoomSize) / 2;
      const zoomY = jumpY - zoomSize - 8;
      if (x >= zoomX && x <= zoomX + zoomSize && y >= zoomY && y <= zoomY + zoomSize) {
        simZoomDown = true;
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = 'Оптика: ЗУМ 3.5x активен (FOV)';
        return;
      }

      // Check drop item button
      const dropSize = 32 * scale;
      const dropX = sneakX;
      const dropY = zoomY;
      if (x >= dropX && x <= dropX + dropSize && y >= dropY && y <= dropY + dropSize) {
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = 'Действие: Выбросить предмет (Q)';
        return;
      }

      simHoldingRight = true;
      simHoldStartTime = Date.now();
      simRightClickPos = { x, y };
      simMiningProgress = 0;
      playUiClickSound();
      if (simFeedback) simFeedback.textContent = 'Действие: Удар / Подготовка к копанию...';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!simIsDraggingStick && !simHoldingRight) return;
    if (!simCanvas) return;
    const rect = simCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (simCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (simCanvas.height / rect.height);
    const scale = Number(settingTouchScale?.value || 100) / 100;
    const stickR = 40 * scale;

    if (simIsDraggingStick) {
      const dx = x - simStickPos.x;
      const dy = y - simStickPos.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= stickR) {
        simStickKnob = { x, y };
      } else {
        simStickKnob = {
          x: simStickPos.x + (dx / dist) * stickR,
          y: simStickPos.y + (dy / dist) * stickR
        };
      }

      // Check sprint forward threshold
      if (dy < -stickR * 0.75 && dist >= stickR * 0.8) {
        simIsSprinting = true;
        if (simFeedback) simFeedback.textContent = 'Бег: СПРИНТ АКТИВЕН (Ctrl)';
      } else {
        simIsSprinting = false;
      }
    }

    if (simHoldingRight) {
      const elapsed = Date.now() - simHoldStartTime;
      const holdThreshold = Number(settingTouchMine?.value || 350);
      simMiningProgress = Math.min(1.0, elapsed / holdThreshold);
      if (simMiningProgress >= 1.0) {
        if (simFeedback) simFeedback.textContent = 'Режим: НЕПРЕРЫВНОЕ ЛОМАНИЕ БЛОКА';
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (simIsDraggingStick) {
      simIsDraggingStick = false;
      simStickKnob = { ...simStickPos };
      simIsSprinting = false;
      if (simFeedback) simFeedback.textContent = 'Стик отпущен';
    }
    if (simHoldingRight) {
      simHoldingRight = false;
      simMiningProgress = 0;
      if (simFeedback) simFeedback.textContent = 'Готов к тестированию';
    }
    simJumpDown = false;
    simZoomDown = false;
  });

  requestAnimationFrame(drawSimHud);
}

// --- APP INITIALIZATION ---
async function initApp() {
  currentSettings = await window.api.getSettings();

  // Populate Nickname
  updateNicknameUI(currentSettings.nickname || 'Player');

  // Populate Health Hearts (Full 20 HP)
  renderSteveHearts();

  // Populate Settings
  if (settingRamSelect) settingRamSelect.value = String(currentSettings.ramMb || 4096);
  if (settingGpuToggle) settingGpuToggle.checked = currentSettings.preferDiscreteGpu !== false;
  if (settingFullscreenToggle) settingFullscreenToggle.checked = Boolean(currentSettings.fullscreen);
  if (settingCustomArgs) settingCustomArgs.value = currentSettings.customArgs || '';

  // Load Active Skin & Steve 3D Model
  const skinRes = await window.api.getSkin();
  if (skinRes && skinRes.skinDataUrl) {
    updateSkinUI(skinRes.skinDataUrl, skinRes.skinName || 'Стив');
  } else {
    updateSkinUI(null, 'Стив');
  }

  // Load Modpack Dock UI
  updateDockModpackUI();

  // Load Saved Servers & Popular Servers
  await loadSavedServers();

  // Load Versions
  await refreshVersions();

  // Pre-load Wardrobe
  await refreshWardrobeUI();

  // Pre-load Touch Controls
  await loadTouchSettingsUI();
}

// Start Application
initApp();
