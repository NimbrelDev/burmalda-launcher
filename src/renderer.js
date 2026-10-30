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
const stagePlayerCursor = document.getElementById('stage-player-cursor');
const stagePlayerInput = document.getElementById('stage-player-input');
let isEditingNametag = false;
const skinViewerCanvas = document.getElementById('skin-viewer-3d');
const btnStageWardrobe = document.getElementById('btn-stage-wardrobe');
const btnStageSettings = document.getElementById('btn-stage-settings');
const btnStageFolder = document.getElementById('btn-stage-folder');


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

// Escape HTML helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// Steve Interaction & Physics State
let isShotgunActive = false;
let shotgunAnim = {
  phase: 'idle', // 'aim', 'firing', 'flying', 'offscreen', 'falling'
  startTime: 0,
  fireTime: 0,
  offscreenStartTime: 0,
  shotgunGroup: null,
  pumpMesh: null,
  flashGroup: null,
  partsFactory: null,
  headOriginalParent: null,
  detachedHeadMesh: null,
  headDetached: false,
  headVx: 0,
  headVy: 0,
  headVz: 0,
  headRotVx: 0,
  headRotVy: 0,
  headRotVz: 0,
  bloodParticles: [],
  bloodSpurtFrames: 0,
  goreChunks: [],
  shatteredSkullStump: null,
  exposedRibcage: null,
  screenFlyX: 0,
  screenFlyVx: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  rotVx: 0,
  rotVy: 0,
  rotVz: 0,
  fallVy: 0
};
let lastPointerEvent = null;
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
let steveBodyRotationY = 0;
let steveSpinVelocity = 0;
let limbGlitchFactor = 0;
let draggedLimb = null;
let steveHurtFlash = 0;
let targetLimbStretch = 0;

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

// --- FLOATING TOAST NOTIFICATIONS ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-pill';

  const iconSvg = `
    <span class="toast-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </span>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Gentle audio pop feedback
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.1);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch (_) {}

  setTimeout(() => {
    toast.classList.add('toast-leaving');
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

// --- TAB NAVIGATION (EXPANDING ACCORDION PILLS) ---
function switchTab(tabName) {
  if (tabName === 'modpacks') {
    modalModpacks?.classList.add('open');
    showModpackSubView('list');
    renderModpacksList();
    return;
  }

  if (['servers', 'friends', 'wardrobe'].includes(tabName)) {
    const names = {
      servers: 'Серверы',
      friends: 'Друзья',
      wardrobe: 'Гардероб'
    };
    showToast(`Раздел «${names[tabName] || tabName}» ещё в разработке ⚙️`);
    return;
  }

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

  if (tabName === 'settings') {
    loadTouchSettingsUI();
  }
}

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    if (tabName) switchTab(tabName);
  });
});

btnStageWardrobe?.addEventListener('click', () => {
  showToast('Гардероб еще в разработке');
});
btnStageSettings?.addEventListener('click', () => switchTab('settings'));

// In-place Minecraft Nametag Editing with Blinking Underscore Cursor
function startEditingNametag() {
  if (isEditingNametag) return;
  isEditingNametag = true;
  btnOpenNametag?.classList.add('editing');
  if (stagePlayerCursor) stagePlayerCursor.style.display = 'inline-block';

  const currentNick = currentSettings.nickname || 'Player';
  if (stagePlayerInput) {
    stagePlayerInput.value = currentNick;
    stagePlayerInput.focus();
    stagePlayerInput.select();
  }
}

async function finishEditingNametag(commit = true) {
  if (!isEditingNametag) return;
  isEditingNametag = false;
  btnOpenNametag?.classList.remove('editing');
  if (stagePlayerCursor) stagePlayerCursor.style.display = 'none';

  if (commit && stagePlayerInput) {
    const rawVal = stagePlayerInput.value.trim();
    const finalNick = rawVal.length > 0 ? rawVal : (currentSettings.nickname || 'Player');
    currentSettings.nickname = finalNick;
    updateNicknameUI(finalNick);
    try {
      await window.api.saveSettings(currentSettings);
    } catch (_) {}
  } else {
    updateNicknameUI(currentSettings.nickname || 'Player');
  }
}

btnOpenNametag?.addEventListener('click', (e) => {
  e.stopPropagation();
  startEditingNametag();
});

stagePlayerInput?.addEventListener('input', () => {
  const val = stagePlayerInput.value;
  if (stagePlayerNick) stagePlayerNick.textContent = val.length > 0 ? val : ' ';
});

stagePlayerInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    finishEditingNametag(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    finishEditingNametag(false);
  }
});

stagePlayerInput?.addEventListener('blur', () => {
  finishEditingNametag(true);
});

window.addEventListener('mousedown', (e) => {
  if (isEditingNametag && !btnOpenNametag?.contains(e.target)) {
    finishEditingNametag(true);
  }
});

dockPlayerCard?.addEventListener('click', () => {
  showToast('Гардероб еще в разработке');
});

// --- STEVE 3D PHYSICAL RAGDOLL & SPRING SIMULATION ---
const stevePhysics = {
  // Head degrees of freedom
  headPitch: { x: 0, v: 0, k: 0.12, d: 0.82 },
  headYaw:   { x: 0, v: 0, k: 0.12, d: 0.82 },
  headRoll:  { x: 0, v: 0, k: 0.14, d: 0.78 },

  // Torso / Body degrees of freedom
  bodyPitch: { x: 0, v: 0, k: 0.11, d: 0.79 },
  bodyRoll:  { x: 0, v: 0, k: 0.11, d: 0.79 },
  bodyYaw:   { x: 0, v: 0, k: 0.11, d: 0.79 },

  // Left Arm degrees of freedom
  lArmPitch: { x: 0, v: 0, k: 0.08, d: 0.84 },
  lArmRoll:  { x: 0, v: 0, k: 0.08, d: 0.84 },
  lArmYaw:   { x: 0, v: 0, k: 0.08, d: 0.84 },

  // Right Arm degrees of freedom
  rArmPitch: { x: 0, v: 0, k: 0.08, d: 0.84 },
  rArmRoll:  { x: 0, v: 0, k: 0.08, d: 0.84 },
  rArmYaw:   { x: 0, v: 0, k: 0.08, d: 0.84 },

  // Left Leg degrees of freedom
  lLegPitch: { x: 0, v: 0, k: 0.10, d: 0.81 },
  lLegRoll:  { x: 0, v: 0, k: 0.10, d: 0.81 },

  // Right Leg degrees of freedom
  rLegPitch: { x: 0, v: 0, k: 0.10, d: 0.81 },
  rLegRoll:  { x: 0, v: 0, k: 0.10, d: 0.81 },

  // Global root displacement & tilt
  recoilZ:   { x: 0, v: 0, k: 0.09, d: 0.82 },
  recoilY:   { x: 0, v: 0, k: 0.10, d: 0.80 },
  recoilX:   { x: 0, v: 0, k: 0.10, d: 0.80 },
  tiltZ:     { x: 0, v: 0, k: 0.09, d: 0.80 }
};

// Step single degree of freedom with viscous damped harmonic motion
function stepSpringDOF(dof) {
  const force = -dof.k * dof.x - (1 - dof.d) * dof.v;
  dof.v += force;
  dof.x += dof.v;
  if (Math.abs(dof.x) < 0.0001 && Math.abs(dof.v) < 0.0001) {
    dof.x = 0;
    dof.v = 0;
  }
}

// Calculate accurate projected 2D screen bounding boxes for Steve's 3D limbs
function getLimbAtPointer(clientX, clientY) {
  if (!skinViewer || !skinViewer.camera || !skinViewer.playerObject || !skinViewer.playerObject.skin) return null;
  const skin = skinViewer.playerObject.skin;
  const w = window.innerWidth || 1040;
  const h = window.innerHeight || 700;

  skinViewer.playerObject.updateMatrixWorld(true);

  if (!skin.body || !skin.body.children || !skin.body.children[0] || !skin.body.children[0].geometry) return null;
  skin.body.children[0].geometry.computeBoundingBox();
  if (!skin.body.children[0].geometry.boundingBox) return null;

  const Box3 = skin.body.children[0].geometry.boundingBox.constructor;
  const Vector3 = skinViewer.camera.position.constructor;

  function getPartScreenBox(obj3d, isHead) {
    if (!obj3d) return null;
    const box = new Box3();
    if (isHead) {
      if (obj3d.children && obj3d.children[0]) box.setFromObject(obj3d.children[0]);
      if (obj3d.children && obj3d.children[1]) box.union(new Box3().setFromObject(obj3d.children[1]));
      if (!obj3d.children || obj3d.children.length === 0) box.setFromObject(obj3d);
    } else {
      box.setFromObject(obj3d);
    }

    const corners = [
      new Vector3(box.min.x, box.min.y, box.min.z),
      new Vector3(box.max.x, box.min.y, box.min.z),
      new Vector3(box.min.x, box.max.y, box.min.z),
      new Vector3(box.max.x, box.max.y, box.min.z),
      new Vector3(box.min.x, box.min.y, box.max.z),
      new Vector3(box.max.x, box.min.y, box.max.z),
      new Vector3(box.min.x, box.max.y, box.max.z),
      new Vector3(box.max.x, box.max.y, box.max.z)
    ];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < 8; i++) {
      const c = corners[i];
      c.project(skinViewer.camera);
      const sx = (c.x * 0.5 + 0.5) * w;
      const sy = (-c.y * 0.5 + 0.5) * h;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }
    return { minX, maxX, minY, maxY };
  }

  // Priority order: Head > Right Arm > Left Arm > Torso > Right Leg > Left Leg
  const list = [
    { name: 'head', isHead: true, obj: skin.head },
    { name: 'rightArm', isHead: false, obj: skin.rightArm },
    { name: 'leftArm', isHead: false, obj: skin.leftArm },
    { name: 'torso', isHead: false, obj: skin.body || skin.torso },
    { name: 'rightLeg', isHead: false, obj: skin.rightLeg },
    { name: 'leftLeg', isHead: false, obj: skin.leftLeg }
  ];

  for (const item of list) {
    const b = getPartScreenBox(item.obj, item.isHead);
    if (b && clientX >= b.minX && clientX <= b.maxX && clientY >= b.minY && clientY <= b.maxY) {
      return { name: item.name, bounds: b };
    }
  }
  return null;
}
window.getLimbAtPointer = getLimbAtPointer;

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

function playShotgunBlastComplete() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(1.35, now);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, now);
    compressor.knee.setValueAtTime(10, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.001, now);
    compressor.release.setValueAtTime(0.25, now);

    master.connect(compressor);
    compressor.connect(ctx.destination);

    // СЛОЙ 1: Тяжелый саб-басовый удар
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(190, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.14);
    subOsc.frequency.exponentialRampToValueAtTime(16, now + 0.45);
    subGain.gain.setValueAtTime(2.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // СЛОЙ 2: Взрывной шум 12 калибра с волной искажения (дисторшн)
    const bufferSize = Math.floor(ctx.sampleRate * 0.65);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      const env = i < 4000 ? 1.4 : Math.exp(-i / (ctx.sampleRate * 0.18));
      output[i] = (white * 0.65 + (b0 + b1 + b2) * 0.5) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.55);

    const shaper = ctx.createWaveShaper();
    const k = 220;
    const curve = new Float32Array(ctx.sampleRate);
    const deg = Math.PI / 180;
    for (let i = 0; i < ctx.sampleRate; ++i) {
      const x = (i * 2) / ctx.sampleRate - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    shaper.curve = curve;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.60);

    noise.connect(shaper);
    shaper.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    // СЛОЙ 3: Хруст плоти и костей
    const crunchTime = now + 0.02;
    const crunchBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
    const cData = crunchBuf.getChannelData(0);
    for (let i = 0; i < cData.length; i++) {
      const mod = Math.sin(i * 0.15) * Math.cos(i * 0.037);
      cData[i] = (Math.random() * 2 - 1) * mod * Math.exp(-i / (ctx.sampleRate * 0.09));
    }
    const crunchSource = ctx.createBufferSource();
    crunchSource.buffer = crunchBuf;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1350, crunchTime);
    bandpass.Q.setValueAtTime(1.2, crunchTime);

    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(1.3, crunchTime);
    crunchGain.gain.exponentialRampToValueAtTime(0.01, crunchTime + 0.34);

    crunchSource.connect(bandpass);
    bandpass.connect(crunchGain);
    crunchGain.connect(master);
    crunchSource.start(crunchTime);

    // СЛОЙ 3.5: Жёсткий треск раскалывающегося черепа и костей
    for (let b = 0; b < 4; b++) {
      const snapT = now + 0.012 + b * 0.018;
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(920 - b * 140, snapT);
      snapOsc.frequency.exponentialRampToValueAtTime(110, snapT + 0.045);
      snapGain.gain.setValueAtTime(0.95, snapT);
      snapGain.gain.exponentialRampToValueAtTime(0.001, snapT + 0.048);
      snapOsc.connect(snapGain);
      snapGain.connect(master);
      snapOsc.start(snapT);
      snapOsc.stop(snapT + 0.05);
    }

    // СЛОЙ 4: Звук помпы (чк-чк)
    setTimeout(() => {
      try {
        const t2 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(540, t2);
        osc.frequency.exponentialRampToValueAtTime(200, t2 + 0.06);
        g.gain.setValueAtTime(0.35, t2);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t2);
        osc.stop(t2 + 0.075);
      } catch (_) {}
    }, 450);
  } catch (err) {
    console.warn('Shotgun sound error:', err);
  }
}

// Crate smash and splinter crash sound
function playCrateSmashSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // 1. Heavy wooden thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    // 2. Wood splintering crack (burst of bandpassed noise)
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(2.2, now);
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.8, now);
    cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    src.connect(filter);
    filter.connect(cGain);
    cGain.connect(ctx.destination);
    src.start(now);
  } catch (_) {}
}

// Comic bonk sound when choosing "НЕТ, Я МАЛЕНЬКИЙ"
function playBonkSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch (_) {}
}

function playMinecraftLandingSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.16);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  } catch (_) {}
}

// Trigger dynamic, unpredictable random reaction depending on which limb was clicked
function triggerRandomSteveReaction(limbName, clientX, clientY) {
  playMinecraftHitSound();

  // Authentic Minecraft damage red flash directly on Steve's 3D skin (ZERO canvas filter/neon)
  steveHurtFlash = 1.0;
  if (skinViewer && skinViewer.playerObject && skinViewer.playerObject.skin) {
    const s = skinViewer.playerObject.skin;
    const mats = [s.layer1Material, s.layer2Material, s.layer1MaterialBiased, s.layer2MaterialBiased];
    mats.forEach((m) => {
      if (m) {
        m.emissive.setRGB(0.95, 0.0, 0.0);
        m.color.setRGB(1.0, 0.35, 0.35);
      }
    });
  }

  // Lock recoilZ so Steve NEVER creeps towards or away from camera
  stevePhysics.recoilZ.x = 0;
  stevePhysics.recoilZ.v = 0;

  const reactionType = Math.floor(Math.random() * 3);

  if (limbName === 'head') {
    if (reactionType === 0) {
      // Recoil & dizzy shake
      stevePhysics.headPitch.v -= 0.65;
      stevePhysics.headYaw.v += (Math.random() > 0.5 ? 0.75 : -0.75);
      stevePhysics.headRoll.v += (Math.random() - 0.5) * 0.5;
    } else if (reactionType === 1) {
      // 360 Spin reaction
      stevePhysics.headYaw.v += (Math.random() > 0.5 ? 2.6 : -2.6);
      stevePhysics.headPitch.v += 0.25;
      stevePhysics.tiltZ.v += 0.12;
    } else {
      // Surprised bounce & nod
      stevePhysics.headPitch.v += 0.55;
      stevePhysics.bodyPitch.v -= 0.20;
      stevePhysics.recoilY.v -= 0.40;
    }
  } else if (limbName === 'rightArm' || limbName === 'leftArm') {
    const isRight = limbName === 'rightArm';
    if (reactionType === 0) {
      // Karate punch forward
      if (isRight) {
        stevePhysics.rArmPitch.v -= 1.8;
        stevePhysics.rArmRoll.v -= 0.5;
        stevePhysics.bodyYaw.v -= 0.25;
      } else {
        stevePhysics.lArmPitch.v -= 1.8;
        stevePhysics.lArmRoll.v += 0.5;
        stevePhysics.bodyYaw.v += 0.25;
      }
    } else if (reactionType === 1) {
      // Frantic flail / wave
      if (isRight) {
        stevePhysics.rArmRoll.v -= 1.6;
        stevePhysics.rArmPitch.v += 0.8;
      } else {
        stevePhysics.lArmRoll.v += 1.6;
        stevePhysics.lArmPitch.v += 0.8;
      }
      stevePhysics.bodyRoll.v += isRight ? -0.15 : 0.15;
    } else {
      // Shoulder recoil shrug
      if (isRight) {
        stevePhysics.rArmPitch.v += 1.1;
        stevePhysics.rArmRoll.v -= 0.8;
      } else {
        stevePhysics.lArmPitch.v += 1.1;
        stevePhysics.lArmRoll.v += 0.8;
      }
      stevePhysics.headPitch.v += 0.2;
    }
  } else if (limbName === 'rightLeg' || limbName === 'leftLeg') {
    const isRight = limbName === 'rightLeg';
    if (reactionType === 0) {
      // High hop jump
      stevePhysics.recoilY.v += 0.95;
      if (isRight) {
        stevePhysics.rLegPitch.v -= 1.3;
        stevePhysics.lLegPitch.v += 0.4;
      } else {
        stevePhysics.lLegPitch.v -= 1.3;
        stevePhysics.rLegPitch.v += 0.4;
      }
    } else if (reactionType === 1) {
      // Sideways stumble
      stevePhysics.tiltZ.v += isRight ? -0.45 : 0.45;
      stevePhysics.bodyRoll.v += isRight ? -0.35 : 0.35;
      stevePhysics.recoilY.v -= 0.35;
    } else {
      // Foot stomp bounce
      if (isRight) stevePhysics.rLegPitch.v -= 0.9;
      else stevePhysics.lLegPitch.v -= 0.9;
      stevePhysics.recoilY.v -= 0.55;
    }
  } else {
    // Torso hit
    if (reactionType === 0) {
      // Classic Minecraft hurt hunch
      stevePhysics.bodyPitch.v += 0.55;
      stevePhysics.headPitch.v += 0.30;
      stevePhysics.recoilY.v -= 0.45;
      stevePhysics.lArmPitch.v += 0.4;
      stevePhysics.rArmPitch.v += 0.4;
    } else if (reactionType === 1) {
      // Double sneak crouch
      stevePhysics.recoilY.v -= 0.8;
      stevePhysics.bodyPitch.v += 0.4;
      stevePhysics.lLegPitch.v -= 0.6;
      stevePhysics.rLegPitch.v -= 0.6;
    } else {
      // Chest recoil & spring bounce
      stevePhysics.bodyPitch.v -= 0.45;
      stevePhysics.bodyRoll.v += (Math.random() - 0.5) * 0.4;
      stevePhysics.recoilY.v += 0.4;
    }
  }
}

// Build authentic 3D Voxel Shotgun using skinview3d Three.js primitives
function createVoxelShotgun(viewer) {
  if (!viewer || !viewer.playerObject || !viewer.playerObject.skin) return null;
  const sampleMesh = viewer.playerObject.skin.head.children[0];
  if (!sampleMesh) return null;

  const BoxGeometry = sampleMesh.geometry.constructor;
  const Mesh = sampleMesh.constructor;
  const Material = sampleMesh.material.constructor;
  const Group = viewer.playerWrapper.constructor;

  const shotgun = new Group();
  shotgun.name = 'voxel_shotgun';

  // Exact 1:1 micro-voxel scale matching Steve model (32 units height)
  const voxSize = 0.65;

  const matDarkMetal = new Material({ color: 0x222730, metalness: 0.75, roughness: 0.3 });
  const matLightMetal = new Material({ color: 0x6e7887, metalness: 0.85, roughness: 0.25 });
  const matChrome = new Material({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 });
  const matWoodDark = new Material({ color: 0x5c3317, roughness: 0.7 });
  const matWoodLight = new Material({ color: 0x784421, roughness: 0.65 });
  const matRubber = new Material({ color: 0x111317, roughness: 0.95 });
  const matRedSight = new Material({ color: 0xff2222, roughness: 0.2 });

  function addVoxelBlock(gx, gy, gz, w, h, d, material, parent = shotgun) {
    const mesh = new Mesh(new BoxGeometry(w * voxSize, h * voxSize, d * voxSize), material);
    mesh.position.set((gx + w / 2) * voxSize, (gy + h / 2) * voxSize, (gz - d / 2) * voxSize);
    parent.add(mesh);
    return mesh;
  }

  // 1. Solid walnut stock with rubber buttpad
  addVoxelBlock(-22, -7, 1.5, 2, 8, 3, matRubber);       // Rubber buttpad
  addVoxelBlock(-20, -6.5, 1.5, 5, 7, 3, matWoodDark);   // Rear stock
  addVoxelBlock(-15, -5.5, 1.5, 5, 6, 3, matWoodLight);  // Mid stock
  addVoxelBlock(-10, -4.5, 1.4, 4, 5, 2.8, matWoodDark); // Wrist neck / grip
  addVoxelBlock(-9, -6.5, 1.2, 3, 2, 2.4, matWoodDark);  // Pistol grip protrusion

  // 2. Metal receiver in center
  addVoxelBlock(-6, -2.5, 1.6, 11, 5, 3.2, matDarkMetal);
  addVoxelBlock(-5, 2.5, 1.3, 9, 0.8, 2.6, matLightMetal); // Receiver top cover
  addVoxelBlock(-2.5, -0.5, 1.75, 4.5, 2.2, 0.4, matChrome); // Chrome ejection port window

  // 3. Trigger guard and trigger hook
  addVoxelBlock(-5.5, -5.5, 0.8, 5, 0.8, 1.6, matDarkMetal);
  addVoxelBlock(-5.5, -4.7, 0.8, 0.8, 2.2, 1.6, matDarkMetal);
  addVoxelBlock(-1.3, -4.7, 0.8, 0.8, 2.2, 1.6, matDarkMetal);
  addVoxelBlock(-3.5, -4.5, 0.5, 0.8, 1.8, 1.0, matChrome); // Trigger hook

  // 4. Heavy steel barrel and tubular magazine
  addVoxelBlock(5, 0.4, 1.2, 21, 2.1, 2.4, matDarkMetal);   // Main barrel
  addVoxelBlock(5, -2.1, 1.1, 18, 1.9, 2.2, matLightMetal); // Tubular magazine
  addVoxelBlock(23, -2.0, 1.1, 1.5, 2.0, 2.2, matDarkMetal);// Magazine cap

  // Ventilated top sight rib with voxel teeth
  for (let bx = 5; bx < 24; bx += 2.5) {
    addVoxelBlock(bx, 2.5, 0.7, 1.4, 0.7, 1.4, matDarkMetal);
  }
  addVoxelBlock(5, 3.1, 0.8, 20, 0.4, 1.6, matDarkMetal); // Top rib bar

  // Muzzle brake compensator with dark bore & red fiber-optic sight
  addVoxelBlock(25.5, 0.1, 1.4, 3.2, 2.7, 2.8, matLightMetal);
  addVoxelBlock(28.5, 0.6, 0.9, 0.6, 1.7, 1.8, matRubber); // Dark muzzle bore
  addVoxelBlock(25.0, 3.5, 0.5, 1.0, 0.9, 1.0, matRedSight); // Red sight bead

  // 5. Sliding ribbed wooden pump forend
  const pumpMesh = new Group();
  shotgun.add(pumpMesh);
  addVoxelBlock(8.5, -3.1, 1.7, 9.5, 3.0, 3.4, matWoodLight, pumpMesh);
  for (let gx = 9.2; gx <= 16.5; gx += 1.8) {
    addVoxelBlock(gx, -3.25, 1.8, 0.8, 3.1, 3.6, matWoodDark, pumpMesh);
  }

  // 6. Muzzle Flash Starburst
  const flashGroup = new Group();
  flashGroup.name = 'muzzle_flash';
  flashGroup.position.set(29.2 * voxSize, 1.5 * voxSize, 0);
  flashGroup.visible = false;
  shotgun.add(flashGroup);

  const flashMatW = new Material({ color: 0xffffff, roughness: 0.1 });
  const flashMatY = new Material({ color: 0xffea00, roughness: 0.1 });
  const flashMatO = new Material({ color: 0xff5500, roughness: 0.1 });

  const core = new Mesh(new BoxGeometry(3.5 * voxSize, 2.2 * voxSize, 2.2 * voxSize), flashMatW);
  core.position.x = 1.8 * voxSize;
  flashGroup.add(core);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const prong = new Mesh(
      new BoxGeometry(4.5 * voxSize, 1.2 * voxSize, 1.2 * voxSize),
      i % 2 === 0 ? flashMatY : flashMatO
    );
    prong.position.set(2.2 * voxSize, Math.cos(angle) * 1.8 * voxSize, Math.sin(angle) * 1.8 * voxSize);
    flashGroup.add(prong);
  }

  return { shotgun, pumpMesh, flashGroup, BoxGeometry, Mesh, Material, Group };
}

// Pre-allocated and cached blood assets for maximum FPS & zero runtime allocations
let cachedBloodGeos = null;
let cachedBloodMats = null;
const neckSpurtPos = { x: 0, y: 0, z: 0 };

function getBloodAssets(BoxGeometry, Material) {
  if (!cachedBloodGeos) {
    cachedBloodGeos = [
      new BoxGeometry(0.60, 0.60, 0.60),
      new BoxGeometry(0.85, 0.85, 0.85),
      new BoxGeometry(1.15, 1.15, 1.15),
      new BoxGeometry(1.45, 1.45, 1.45)
    ];
  }
  if (!cachedBloodMats) {
    const bloodColors = [0x4a0000, 0x6e0303, 0x8b0000, 0xa50808, 0xc91212, 0x3b0000, 0xee2020];
    cachedBloodMats = bloodColors.map((color) => new Material({ color: color, roughness: 0.5 }));
  }
  return { cachedBloodGeos, cachedBloodMats };
}

// Massive Voxel Blood Fountain (140+ crimson, scarlet & dark maroon cubes)
function spawnBloodVoxels(pos, count) {
  if (!shotgunAnim.partsFactory || !skinViewer || !skinViewer.scene) return;
  const { BoxGeometry, Mesh, Material } = shotgunAnim.partsFactory;
  const { cachedBloodGeos, cachedBloodMats } = getBloodAssets(BoxGeometry, Material);

  for (let i = 0; i < count; i++) {
    const geo = cachedBloodGeos[i % cachedBloodGeos.length];
    const mat = cachedBloodMats[i % cachedBloodMats.length];
    const cube = new Mesh(geo, mat);

    cube.position.set(
      pos.x + (Math.random() - 0.5) * 3.5,
      pos.y + (Math.random() - 0.5) * 2.5,
      pos.z + (Math.random() - 0.5) * 3.5
    );

    cube.userData = {
      vx: -8.0 - Math.random() * 26.0,   // Blasts violently left away from shotgun on right
      vy: 6.0 + Math.random() * 26.0,    // High geyser upwards
      vz: (Math.random() - 0.5) * 16.0,  // Scatter in depth
      rotX: (Math.random() - 0.5) * 0.5,
      rotY: (Math.random() - 0.5) * 0.5,
      rotZ: (Math.random() - 0.5) * 0.5
    };

    skinViewer.scene.add(cube);
    shotgunAnim.bloodParticles.push(cube);
  }
}

// -----------------------------------------------------------------------------
// 3D BONE & ORGAN PIECES, ANATOMICAL SKULL STUMP, EXPOSED RIBS & CRATE PYRAMID
// (Migrated from anatomical dismemberment simulation)
// -----------------------------------------------------------------------------

// Build authentic 3D Crate with wooden edge beams, cross braces & iron corners
function buildDetailedCrateMesh(BoxGeometry, Mesh, Material, Group) {
  const SafeGroup = Group || (skinViewer && skinViewer.scene && skinViewer.scene.constructor) || Object;
  const group = new SafeGroup();
  group.name = 'wooden_crate';

  const woodFrameMat = new Material({ color: 0x6b3e19, roughness: 0.8 });
  const ironCornerMat = new Material({ color: 0x363d47, metalness: 0.75, roughness: 0.35 });
  const crateFaceMat = new Material({ color: 0xa06232, roughness: 0.75 });

  // 1. Core wooden box (authentic proportion 5.6 x 5.6 x 5.6)
  const core = new Mesh(new BoxGeometry(5.6, 5.6, 5.6), crateFaceMat);
  group.add(core);

  // 2. 12 edge beams (3D frame along all 12 edges)
  const beamThick = 0.55;
  const beamLen = 5.9;
  const offset = 2.7;

  const beamGeoX = new BoxGeometry(beamLen, beamThick, beamThick);
  const beamGeoY = new BoxGeometry(beamThick, beamLen, beamThick);
  const beamGeoZ = new BoxGeometry(beamThick, beamThick, beamLen);

  for (let s1 of [-1, 1]) {
    for (let s2 of [-1, 1]) {
      const bx = new Mesh(beamGeoX, woodFrameMat);
      bx.position.set(0, s1 * offset, s2 * offset);
      group.add(bx);

      const by = new Mesh(beamGeoY, woodFrameMat);
      by.position.set(s1 * offset, 0, s2 * offset);
      group.add(by);

      const bz = new Mesh(beamGeoZ, woodFrameMat);
      bz.position.set(s1 * offset, s2 * offset, 0);
      group.add(bz);
    }
  }

  // 3. Diagonal cross braces on front and back
  const braceGeo = new BoxGeometry(6.6, 0.48, 0.25);
  for (let sideZ of [-2.8, 2.8]) {
    const brace = new Mesh(braceGeo, woodFrameMat);
    brace.position.set(0, 0, sideZ);
    brace.rotation.z = Math.PI / 4;
    group.add(brace);
  }

  // 4. Metal corner brackets on all 8 corners
  const cornerGeo = new BoxGeometry(0.9, 0.9, 0.9);
  for (let cx of [-1, 1]) {
    for (let cy of [-1, 1]) {
      for (let cz of [-1, 1]) {
        const corner = new Mesh(cornerGeo, ironCornerMat);
        corner.position.set(cx * 2.7, cy * 2.7, cz * 2.7);
        group.add(corner);
      }
    }
  }

  return group;
}

// Crates hidden by user request
let crates = [];
let crateCollided = false;

// Crates hidden by user request
function spawnCratesPyramid(viewer) {
  if (!viewer || !viewer.scene) return;
  crates.forEach((c) => {
    if (viewer.scene) viewer.scene.remove(c.mesh);
  });
  crates = [];
  crateCollided = false;
}

function resetCratesPyramid() {
  crates.forEach((c) => {
    if (c.mesh) c.mesh.visible = false;
  });
  crateCollided = false;
}

// Authentic 3D Ground Shadows under Steve's feet
function spawnSteve3DShadow(viewer) {
  if (!viewer || !viewer.scene || !viewer.playerObject || !viewer.playerObject.skin) return;
  const sampleMesh = viewer.playerObject.skin.head.children[0];
  if (!sampleMesh) return;
  const BoxGeometry = sampleMesh.geometry.constructor;
  const Mesh = sampleMesh.constructor;
  const Material = sampleMesh.material.constructor;

  const oldSteve = viewer.scene.getObjectByName('steve_shadow_3d');
  if (oldSteve) viewer.scene.remove(oldSteve);
  const oldCrates = viewer.scene.getObjectByName('crates_shadow_3d');
  if (oldCrates) viewer.scene.remove(oldCrates);

  const shadowMat = new Material({
    color: 0x070b10,
    transparent: true,
    opacity: 0.45,
    roughness: 0.95
  });

  const curScale = (viewer.playerWrapper ? viewer.playerWrapper.scale.y : 1.0) || 1.0;
  const floorY = -0.5 - (16 * curScale);

  // Flat shadow directly under Steve's feet (centered at x = 0)
  const steveShadow = new Mesh(new BoxGeometry(10.5 * (curScale / 1.0), 0.1, 6.8 * (curScale / 1.0)), shadowMat);
  steveShadow.position.set(0, floorY + 0.05, 0);
  steveShadow.name = 'steve_shadow_3d';
  viewer.scene.add(steveShadow);
}

// Cervical vertebrae, broken jaw, knocked-out teeth & shattered skull base on neck stump
function createShatteredSkullStump(BoxGeometry, Mesh, Material, Group) {
  const SafeGroup = Group || (skinViewer && skinViewer.scene && skinViewer.scene.constructor) || Object;
  const group = new SafeGroup();
  group.name = 'shattered_skull_stump';

  const matBone = new Material({ color: 0xede6d6, roughness: 0.45 });
  const matBoneBloody = new Material({ color: 0xc99c8e, roughness: 0.5 });
  const matTooth = new Material({ color: 0xffffff, roughness: 0.2 });
  const matFlesh = new Material({ color: 0x7a0000, roughness: 0.3 });
  const matBrain = new Material({ color: 0xd45d79, roughness: 0.35 });

  // 1. Cervical vertebrae (3 protruding from neck stump)
  for (let i = 0; i < 3; i++) {
    const vert = new Mesh(new BoxGeometry(1.8, 1.1, 1.8), matBone);
    vert.position.set(0, 1.2 + i * 1.4, -0.3);
    group.add(vert);

    // Intervertebral bloody disc
    const disc = new Mesh(new BoxGeometry(1.5, 0.45, 1.5), matFlesh);
    disc.position.set(0, 1.8 + i * 1.4, -0.3);
    group.add(disc);
  }

  // 2. Fractured skull base and lower jaw
  const jawBase = new Mesh(new BoxGeometry(4.8, 1.6, 5.0), matBoneBloody);
  jawBase.position.set(0, 1.8, 0.4);
  group.add(jawBase);

  // Sharp protruding skull bone shards
  const shardDefs = [
    [-2.0, 3.2, -1.6, 1.0, 2.4, 1.2, 0.2, 0, -0.25],
    [ 2.0, 3.0, -1.5, 1.0, 2.0, 1.4, -0.15, 0, 0.3],
    [-1.6, 2.8,  1.8, 1.2, 1.8, 1.0, -0.2, 0, -0.2],
    [ 1.5, 3.4,  1.6, 1.0, 2.5, 1.2, 0.25, 0, 0.2],
    [ 0.0, 3.5, -2.0, 2.6, 2.2, 0.8, -0.3, 0, 0]
  ];
  shardDefs.forEach(([x, y, z, w, h, d, rx, ry, rz]) => {
    const shard = new Mesh(new BoxGeometry(w, h, d), matBone);
    shard.position.set(x, y, z);
    shard.rotation.set(rx, ry, rz);
    group.add(shard);
  });

  // 3. Teeth on lower jaw
  for (let t = -2; t <= 2; t++) {
    if (t === 1) continue; // broken tooth!
    const tooth = new Mesh(new BoxGeometry(0.65, 0.8, 0.65), matTooth);
    tooth.position.set(t * 0.8, 2.8, 2.4);
    group.add(tooth);
  }

  // 4. Flesh cavity & brain remnant
  const fleshCore = new Mesh(new BoxGeometry(3.6, 1.8, 3.6), matFlesh);
  fleshCore.position.set(0, 2.5, 0);
  group.add(fleshCore);

  const brainRemnant = new Mesh(new BoxGeometry(2.4, 1.4, 2.2), matBrain);
  brainRemnant.position.set(-0.3, 3.4, -0.4);
  brainRemnant.rotation.set(0.3, 0.4, -0.2);
  group.add(brainRemnant);

  return group;
}

// Exposed ribcage with broken white ribs & spinal column inside torso
function createExposedRibcage(BoxGeometry, Mesh, Material, Group) {
  const SafeGroup = Group || (skinViewer && skinViewer.scene && skinViewer.scene.constructor) || Object;
  const group = new SafeGroup();
  group.name = 'exposed_ribcage';

  const matBone = new Material({ color: 0xede6d6, roughness: 0.4 });
  const matCavity = new Material({ color: 0x4a0000, roughness: 0.35 });

  // 1. Entrance/exit wound cavity (dark maroon flesh)
  const cavity = new Mesh(new BoxGeometry(4.8, 6.5, 3.8), matCavity);
  cavity.position.set(0, 0.6, 0.2);
  group.add(cavity);

  // 2. Spine column inside chest
  const spine = new Mesh(new BoxGeometry(1.4, 7.0, 1.4), matBone);
  spine.position.set(0, 0.6, -0.5);
  group.add(spine);

  // 3. 4 pairs of broken white ribs protruding through the chest
  for (let r = 0; r < 4; r++) {
    const yPos = 2.8 - r * 1.5;
    const ribL = new Mesh(new BoxGeometry(2.3, 0.65, 1.0), matBone);
    ribL.position.set(-1.6, yPos, 1.6);
    ribL.rotation.z = 0.20;
    ribL.rotation.y = -0.25;
    group.add(ribL);

    const ribR = new Mesh(new BoxGeometry(2.3, 0.65, 1.0), matBone);
    ribR.position.set(1.6, yPos, 1.6);
    ribR.rotation.z = -0.20;
    ribR.rotation.y = 0.25;
    group.add(ribR);
  }

  return group;
}

// Flying anatomical bone, skull, eyeball & organ debris
function createDetailedSkullOrBoneMesh(type, BoxGeometry, Mesh, Material, Group) {
  const SafeGroup = Group || (skinViewer && skinViewer.scene && skinViewer.scene.constructor) || Object;
  const group = new SafeGroup();
  const matSkullBone = new Material({ color: 0xf0e9d8, roughness: 0.4 });
  const matBloodyBone = new Material({ color: 0xd4a59a, roughness: 0.5 });
  const matMarrow = new Material({ color: 0x8a0404, roughness: 0.35 });
  const matTooth = new Material({ color: 0xffffff, roughness: 0.15 });
  const matSkin = new Material({ color: 0xc68662, roughness: 0.75 });
  const matHair = new Material({ color: 0x3b2618, roughness: 0.8 });
  const matBrain = new Material({ color: 0xd9627a, roughness: 0.3 });

  if (type === 'cranium_plate') {
    const plate = new Mesh(new BoxGeometry(3.0, 2.4, 0.9), matSkullBone);
    const inner = new Mesh(new BoxGeometry(2.4, 1.9, 0.5), matMarrow);
    inner.position.z = -0.5;
    group.add(plate, inner);
    return { mesh: group, halfSize: 1.4 };
  }

  if (type === 'eye_socket_bone') {
    const topBar = new Mesh(new BoxGeometry(3.2, 1.1, 1.2), matSkullBone);
    const sideBar = new Mesh(new BoxGeometry(1.1, 2.2, 1.2), matSkullBone);
    sideBar.position.set(-1.1, -0.7, 0);
    const bloodyBack = new Mesh(new BoxGeometry(2.6, 0.9, 0.7), matMarrow);
    bloodyBack.position.set(0, 0, -0.7);
    group.add(topBar, sideBar, bloodyBack);
    return { mesh: group, halfSize: 1.5 };
  }

  if (type === 'jaw_with_teeth') {
    const jaw = new Mesh(new BoxGeometry(2.8, 1.0, 1.2), matSkullBone);
    const gum = new Mesh(new BoxGeometry(2.4, 0.5, 0.9), matMarrow);
    gum.position.y = 0.5;
    group.add(jaw, gum);
    for (let t = -1; t <= 1; t++) {
      const tooth = new Mesh(new BoxGeometry(0.55, 0.7, 0.55), matTooth);
      tooth.position.set(t * 0.8, 1.0, 0.2);
      group.add(tooth);
    }
    return { mesh: group, halfSize: 1.3 };
  }

  if (type === 'rib_bone') {
    const shaft = new Mesh(new BoxGeometry(3.4, 0.65, 0.65), matSkullBone);
    const tip1 = new Mesh(new BoxGeometry(0.9, 0.9, 0.8), matMarrow);
    tip1.position.x = -1.7;
    const tip2 = new Mesh(new BoxGeometry(1.1, 0.6, 0.6), matBloodyBone);
    tip2.position.set(1.6, -0.3, 0);
    tip2.rotation.z = -0.4;
    group.add(shaft, tip1, tip2);
    return { mesh: group, halfSize: 1.1 };
  }

  if (type === 'vertebra_bone') {
    const core = new Mesh(new BoxGeometry(1.5, 1.3, 1.5), matSkullBone);
    const spinePin = new Mesh(new BoxGeometry(0.5, 0.7, 2.0), matBloodyBone);
    const cord = new Mesh(new BoxGeometry(0.7, 1.4, 0.7), matMarrow);
    group.add(core, spinePin, cord);
    return { mesh: group, halfSize: 1.1 };
  }

  if (type === 'eyeball') {
    const sclera = new Mesh(new BoxGeometry(1.4, 1.4, 1.4), matTooth);
    const iris = new Mesh(new BoxGeometry(0.7, 0.7, 0.2), new Material({ color: 0x493699 }));
    iris.position.z = 0.75;
    const nerve = new Mesh(new BoxGeometry(0.45, 0.45, 1.6), matMarrow);
    nerve.position.z = -1.2;
    group.add(sclera, iris, nerve);
    return { mesh: group, halfSize: 0.9 };
  }

  if (type === 'scalp_chunk') {
    const skin = new Mesh(new BoxGeometry(2.6, 2.4, 0.6), Math.random() > 0.4 ? matHair : matSkin);
    const boneLayer = new Mesh(new BoxGeometry(2.2, 2.0, 0.5), matSkullBone);
    boneLayer.position.z = -0.5;
    const fleshLayer = new Mesh(new BoxGeometry(1.9, 1.7, 0.4), matMarrow);
    fleshLayer.position.z = -0.9;
    group.add(skin, boneLayer, fleshLayer);
    return { mesh: group, halfSize: 1.3 };
  }

  if (type === 'brain_chunk') {
    const b1 = new Mesh(new BoxGeometry(2.0, 1.5, 1.6), matBrain);
    const b2 = new Mesh(new BoxGeometry(1.4, 1.6, 1.2), matMarrow);
    b2.position.set(0.4, -0.3, 0.3);
    group.add(b1, b2);
    return { mesh: group, halfSize: 1.1 };
  }

  // Default: sharp bone shard
  const shard = new Mesh(new BoxGeometry(1.0, 2.0, 0.8), matSkullBone);
  group.add(shard);
  return { mesh: group, halfSize: 0.9 };
}

// Start Shotgun Easter Egg Execution
function startShotgunEasterEgg() {
  if (isShotgunActive || !skinViewer || !skinViewer.playerObject || !skinViewer.scene) return;

  const parts = createVoxelShotgun(skinViewer);
  if (!parts) return;

  // Reset all dynamic spinning and centrifugal stretch states cleanly
  steveSpinVelocity = 0;
  steveBodyRotationY = 0;
  limbGlitchFactor = 0;
  if (skinViewer.playerObject.skin) {
    const s = skinViewer.playerObject.skin;
    if (s.head) s.head.position.set(0, 0, 0);
    if (s.leftArm) s.leftArm.position.set(5, -2, 0);
    if (s.rightArm) s.rightArm.position.set(-5, -2, 0);
    if (s.leftLeg) s.leftLeg.position.set(1.9, -12, -0.1);
    if (s.rightLeg) s.rightLeg.position.set(-1.9, -12, -0.1);
    if (s.body) s.body.position.set(0, -6, 0);
  }

  isShotgunActive = true;
  shotgunAnim.phase = 'aim';
  shotgunAnim.startTime = Date.now();
  shotgunAnim.shotgunGroup = parts.shotgun;
  shotgunAnim.pumpMesh = parts.pumpMesh;
  shotgunAnim.flashGroup = parts.flashGroup;
  shotgunAnim.partsFactory = parts;
  shotgunAnim.bloodParticles = [];
  shotgunAnim.goreChunks = [];
  shotgunAnim.shatteredSkullStump = null;
  shotgunAnim.exposedRibcage = null;
  shotgunAnim.bloodSpurtFrames = 0;
  shotgunAnim.detachedHeadMesh = null;
  shotgunAnim.headDetached = false;
  shotgunAnim.screenFlyX = 0;
  shotgunAnim.screenFlyVx = 0;
  crateCollided = false;

  // Shotgun appears on the RIGHT at exact head level (y = 12.0) with perfectly flat horizontal angle
  parts.shotgun.position.set(42, 12.0, 0);
  parts.shotgun.lookAt(0, 12.0, 0);
  parts.shotgun.rotateY(-Math.PI / 2); // Barrels face Steve directly, stock faces away!
  skinViewer.scene.add(parts.shotgun);
}

// Trigger Secret Easter Egg with 16+ Age Verification Dialog (Shown ONLY ONCE on first discovery)
function triggerShotgunEasterEgg() {
  if (isShotgunActive || !skinViewer || !skinViewer.playerObject || !skinViewer.scene) return;

  const alreadyConfirmed = localStorage.getItem('easter_egg_16_confirmed') === 'true';
  if (alreadyConfirmed) {
    startShotgunEasterEgg();
    return;
  }

  const modalAgeWarning = document.getElementById('modal-age-warning');
  if (modalAgeWarning) {
    modalAgeWarning.style.display = 'flex';
  } else {
    startShotgunEasterEgg();
  }
}

// Global hook for easy testing and debugging
window.__triggerShotgunEasterEgg = triggerShotgunEasterEgg;
window.addEventListener('keydown', (e) => {
  // Easter egg keyboard trigger: ONLY unreserved shortcut Ctrl + Shift + Y (or KeyX)
  if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
    const k = e.key ? e.key.toLowerCase() : '';
    if (e.code === 'KeyY' || k === 'y' || k === 'н' ||
        e.code === 'KeyX' || k === 'x' || k === 'ч') {
      e.preventDefault();
      e.stopPropagation();
      triggerShotgunEasterEgg();
    }
  }
});

// Setup 16+ Warning Modal listeners
const modalAgeWarning = document.getElementById('modal-age-warning');
const btnAgeYes = document.getElementById('btn-age-yes');
const btnAgeNo = document.getElementById('btn-age-no');

btnAgeYes?.addEventListener('click', () => {
  try {
    localStorage.setItem('easter_egg_16_confirmed', 'true');
  } catch (_) {}
  if (modalAgeWarning) modalAgeWarning.style.display = 'none';
  startShotgunEasterEgg();
});

btnAgeNo?.addEventListener('click', () => {
  if (modalAgeWarning) modalAgeWarning.style.display = 'none';
  playBonkSound();
  stevePhysics.headPitch.v -= 0.35;
  stevePhysics.tiltZ.v += 0.25;
  stevePhysics.recoilZ.x = 0;
  stevePhysics.recoilZ.v = 0;
});

// Initialize 3D Steve SkinViewer (ZERO jitter, custom unified physics)
function initSkinViewer(skinSrc) {
  if (!skinViewerCanvas) return;
  const resolved = skinSrc || 'assets/default_skins/steve.png';

  try {
    if (window.skinview3d && !skinViewer) {
      const initialWidth = window.innerWidth || 1280;
      const initialHeight = window.innerHeight || 720;

      skinViewer = new window.skinview3d.SkinViewer({
        canvas: skinViewerCanvas,
        width: initialWidth,
        height: initialHeight,
        skin: resolved
      });
      window.skinViewer = skinViewer;

      // Exactly 1.0 scale for Steve
      const baseSteveScale = 1.0;

      if (skinViewer.playerWrapper) {
        skinViewer.playerWrapper.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
      } else if (skinViewer.playerObject) {
        skinViewer.playerObject.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
      }

      const initialHeightRatio = Math.max(0.70, initialHeight / 700);
      skinViewer.zoom = 0.85;
      skinViewer.camera.position.x = 0;
      skinViewer.camera.position.y = -0.5;
      skinViewer.camera.position.z = 52 * initialHeightRatio;
      skinViewer.camera.lookAt(0, -0.5, 0);
      skinViewer.controls.target.set(0, -0.5, 0);
      skinViewer.fov = 50;
      skinViewer.controls.enableRotate = false; // We handle dragging and physics directly!
      skinViewer.controls.enableZoom = false;
      skinViewer.controls.enablePan = false;

      // DO NOT set skinViewer.animation to avoid internal loop fighting!
      skinViewer.animation = null;

      setupSteveInteractiveControls();
      spawnCratesPyramid(skinViewer);
      spawnSteve3DShadow(skinViewer);
      updateSteveUIPositions();

      // Responsive canvas resizing: camera distance dynamically compensates for fullscreen height
      function updateViewerDimensions() {
        if (!skinViewer) return;
        const w = window.innerWidth || 1040;
        const h = window.innerHeight || 700;
        if (w > 0 && h > 0) {
          skinViewer.setSize(w, h);
          // Fixed 1.0 model scale so Steve stays consistent
          if (skinViewer.playerWrapper) {
            skinViewer.playerWrapper.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
          } else if (skinViewer.playerObject) {
            skinViewer.playerObject.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
          }

          // Camera distance moves back proportionally on taller/fullscreen resolutions
          const heightRatio = Math.max(0.70, h / 700);
          const baseZ = 52 * heightRatio;

          const aspect = w / h;
          if (aspect < 1.3) {
            skinViewer.camera.position.z = baseZ + (1.3 - aspect) * 16;
          } else {
            skinViewer.camera.position.z = baseZ;
          }
          skinViewer.camera.position.x = 0;
          skinViewer.camera.position.y = -0.5;
          skinViewer.camera.lookAt(0, -0.5, 0);
          if (skinViewer.controls) skinViewer.controls.target.set(0, -0.5, 0);
        }
        updateSteveUIPositions();
      }

      window.addEventListener('resize', updateViewerDimensions);
      const resizeObserver = new ResizeObserver(updateViewerDimensions);
      resizeObserver.observe(document.body);
    } else if (skinViewer) {
      skinViewer.loadSkin(resolved);
      if (skinViewer.playerWrapper) skinViewer.playerWrapper.scale.set(0.50, 0.50, 0.50);
      updateSteveUIPositions();
    }
  } catch (err) {
    console.warn('3D SkinViewer fallback:', err);
  }
}

// Dynamically center 2D UI elements (nametag, buttons bar, and hitbox) over Steve's projected 3D position
function updateSteveUIPositions() {
  if (!skinViewer || !skinViewer.camera || !skinViewer.playerObject) return;
  try {
    const Vector3 = skinViewer.camera.position.constructor;
    const w = window.innerWidth || 1040;
    const h = window.innerHeight || 700;

    const nametag = document.getElementById('btn-open-nametag');
    const hitbox = document.getElementById('steve-interactive-zone');
    const stageIconBar = document.querySelector('.stage-icon-bar');

    const curScale = (skinViewer.playerWrapper ? skinViewer.playerWrapper.scale.y : (skinViewer.playerObject ? skinViewer.playerObject.scale.y : 1.0)) || 1.0;
    // Vanilla Minecraft nametag offset: top of head (16) + exact 0.5 block clearance (8.4 units in Three.js coords)
    const headOffsetY = (16 + 8.4) * curScale;
    const feetOffsetY = 16 * curScale;

    // 1. Position nametag cleanly above Steve's head
    if (nametag) {
      const headTop = new Vector3();
      headTop.set(skinViewer.playerObject.position.x, skinViewer.playerObject.position.y + headOffsetY, 0);
      headTop.project(skinViewer.camera);
      const nameX = Math.round((headTop.x * 0.5 + 0.5) * w);
      const nameY = Math.round((-headTop.y * 0.5 + 0.5) * h);
      nametag.style.left = `${nameX}px`;
      nametag.style.top = `${nameY}px`;
    }

    // 2. Position action buttons bar comfortably below Steve's feet
    if (stageIconBar) {
      const feet = new Vector3();
      feet.set(skinViewer.playerObject.position.x, skinViewer.playerObject.position.y - feetOffsetY, 0);
      feet.project(skinViewer.camera);
      const feetX = Math.round((feet.x * 0.5 + 0.5) * w);
      const feetY = Math.round((-feet.y * 0.5 + 0.5) * h);
      stageIconBar.style.left = `${feetX}px`;
      stageIconBar.style.top = `${Math.min(feetY + 16, h - 140)}px`;
      stageIconBar.style.bottom = 'auto';
    }
  } catch (_) {}
}

// Normalize angle to (-PI, PI] so Steve always turns in the shortest direction (max half-turn)
function normalizeAngle(rad) {
  rad = (rad + Math.PI) % (2 * Math.PI);
  if (rad < 0) rad += 2 * Math.PI;
  return rad - Math.PI;
}

// Setup Dragging, Pushing & Punching on Steve (Mouse & Touch)
function setupSteveInteractiveControls() {
  const steveHitbox = document.getElementById('steve-interactive-zone') || skinViewerCanvas;
  if (!steveHitbox) return;

  // Track cursor across window for natural head orientation
  window.addEventListener('mousemove', (e) => {
    if (isShotgunActive || !skinViewer || !skinViewer.playerObject || !skinViewer.playerObject.skin) return;

    // Hover cursor feedback: show grab hand ONLY when mouse is directly over Steve's actual limbs
    if (!isDraggingSteve) {
      const hit = getLimbAtPointer(e.clientX, e.clientY);
      steveHitbox.style.cursor = hit ? 'grab' : 'default';
    }

    try {
      const Vector3 = skinViewer.camera.position.constructor;
      const headWorld = new Vector3();
      skinViewer.playerObject.skin.head.getWorldPosition(headWorld);
      headWorld.y += 4.0; // Center of head cube
      headWorld.project(skinViewer.camera);

      const w = window.innerWidth || 1040;
      const h = window.innerHeight || 700;
      const headScreenX = (headWorld.x * 0.5 + 0.5) * w;
      const headScreenY = (-headWorld.y * 0.5 + 0.5) * h;

      const dx = e.clientX - headScreenX;
      const dy = e.clientY - headScreenY;

      // Angular look target towards mouse
      const angleYaw = Math.atan2(dx, 450);
      const anglePitch = Math.atan2(dy, 450);

      // Clamped to natural anatomical neck range
      targetHeadYaw = Math.max(-0.65, Math.min(0.65, angleYaw - steveBodyRotationY));
      targetHeadPitch = Math.max(-0.45, Math.min(0.45, anglePitch));
    } catch (_) {}
  });

  // Pointer input unified handlers (Mouse & Touch)
  function handlePointerDown(clientX, clientY) {
    if (isShotgunActive) return;

    // Hit-test on actual 3D limbs: if clicked outside Steve, ignore completely!
    const hit = getLimbAtPointer(clientX, clientY);
    if (!hit) {
      isDraggingSteve = false;
      draggedLimb = null;
      return;
    }

    isDraggingSteve = true;
    draggedLimb = hit.name;
    dragStartX = clientX;
    dragStartY = clientY;
    dragLastX = clientX;
    dragLastY = clientY;
    dragDistance = 0;
    dragVelX = 0;
    dragVelY = 0;
    steveHitbox.style.cursor = 'grabbing';
  }

  function handlePointerMove(clientX, clientY) {
    if (!isDraggingSteve || isShotgunActive) return;
    const dx = clientX - dragLastX;
    const dy = clientY - dragLastY;

    dragDistance += Math.hypot(dx, dy);
    dragVelX = dx;
    dragVelY = dy;
    dragLastX = clientX;
    dragLastY = clientY;

    // Normal, clean 3D character rotation: direct, smooth and solid
    steveSpinVelocity = dx * 0.018;
    steveBodyRotationY += dx * 0.018;
    steveBodyRotationY = normalizeAngle(steveBodyRotationY);

    // Stretch activation: ONLY if pulled downwards strongly OR whipped with extreme violent speed
    const pullY = clientY - dragStartY;
    const frameSpeed = Math.hypot(dx, dy);

    // a) Pulling down: starts stretching noticeably after 35px downward pull
    const downPull = Math.max(0, (pullY - 35) / 95);
    // b) Extreme violent movement:
    const violentSpeed = Math.max(0, (frameSpeed - 30) / 20);

    targetLimbStretch = Math.min(1.0, Math.max(downPull, violentSpeed));
  }

  function handlePointerUp(clientX, clientY) {
    if (!isDraggingSteve) return;
    isDraggingSteve = false;
    targetLimbStretch = 0;

    const hit = getLimbAtPointer(clientX, clientY);
    steveHitbox.style.cursor = hit ? 'grab' : 'default';

    if (dragDistance < 12) {
      // Short click/tap: Exact limb hit registered!
      // 1. Requirement: Exactly 0.1% chance on clicking Steve anywhere!
      if (Math.random() < 0.001) {
        draggedLimb = null;
        triggerShotgunEasterEgg();
        return;
      }

      // 2. 99.9% cases: Play varied, random reactions on the clicked limb!
      triggerRandomSteveReaction(draggedLimb || 'torso', clientX, clientY);
    } else if (!isShotgunActive) {
      // Released with fling velocity: Ragdoll push impulse!
      stevePhysics.tiltZ.v = -dragVelX * 0.035;
      stevePhysics.headYaw.v = -dragVelX * 0.045;
      stevePhysics.lArmRoll.v = dragVelX * 0.02;
      stevePhysics.rArmRoll.v = -dragVelX * 0.02;
      stevePhysics.bodyRoll.v = -dragVelX * 0.018;
    }
    draggedLimb = null;
  }

  // Mouse Listeners
  steveHitbox.addEventListener('mousedown', (e) => {
    lastPointerEvent = e;
    handlePointerDown(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', (e) => handlePointerUp(e.clientX, e.clientY));

  // Touch Listeners for Mobile
  steveHitbox.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      lastPointerEvent = e;
      e.preventDefault();
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDraggingSteve && e.touches && e.touches[0]) {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (isDraggingSteve) {
      const touch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      handlePointerUp(touch ? touch.clientX : dragLastX, touch ? touch.clientY : dragLastY);
    }
  });

  // Main Unified Render & Physics Animation Loop
  function updateSteveFrame() {
    window.__stepSteveFrame = updateSteveFrame;
    simTime += 0.025;

    if (skinViewer && skinViewer.playerObject && skinViewer.playerObject.skin) {
      const skin = skinViewer.playerObject.skin;
      const head = skin.head;
      const torso = skin.body || skin.torso;
      const leftArm = skin.leftArm;
      const rightArm = skin.rightArm;
      const leftLeg = skin.leftLeg;
      const rightLeg = skin.rightLeg;

      if (isShotgunActive) {
        const now = Date.now();

        if (shotgunAnim.phase === 'aim') {
          const elapsed = now - shotgunAnim.startTime;
          const totalAimTime = 430; // Crisp original speed: fires almost immediately upon foot plant (420ms -> 430ms)

          // 1. Shotgun: level at head height (y = 12.0), 0° angle, glides in smoothly
          const gunEase = 1 - Math.pow(1 - Math.min(1, elapsed / 240), 3);
          if (shotgunAnim.shotgunGroup) {
            shotgunAnim.shotgunGroup.position.x = 42 - 20 * gunEase; // Smoothly stops at x = 22
            shotgunAnim.shotgunGroup.position.y = 12.0;
            shotgunAnim.shotgunGroup.position.z = 0;
            shotgunAnim.shotgunGroup.lookAt(0, 12.0, 0); // Flat 0° angle
            shotgunAnim.shotgunGroup.rotateY(-Math.PI / 2); // Muzzle points directly into Steve!
          }

          // 2. Turning reaction at true crisp Minecraft speed (head ~140ms, body ~180ms)
          const headTurnT = Math.min(1, elapsed / 140);
          const headEase = 1 - Math.pow(1 - headTurnT, 3);

          const bodyTurnT = Math.min(1, elapsed / 180);
          const bodyEase = 1 - Math.pow(1 - bodyTurnT, 3);

          let currentBodyYaw = 0.58 * bodyEase; // Body turns slightly sideways (~33°)
          let currentHeadYaw = (Math.PI / 2) * headEase - currentBodyYaw;

          // 3. Exact 1-step backward at original crisp Minecraft speed (starts 160ms, duration 260ms -> foot plants at 420ms)
          let leftLegRotX = 0;
          let rightLegRotX = 0;
          let leftArmRotX = 0;
          let rightArmRotX = 0;

          const stepStartTime = 160; // Starts right after head locks onto the shotgun
          const stepDuration = 260;  // Crisp, authentic Minecraft walk speed (260ms)

          if (elapsed >= stepStartTime) {
            const stepT = Math.min(1, (elapsed - stepStartTime) / stepDuration);
            // Smoothstep curve for natural ground push and foot plant
            const stepEase = stepT * stepT * (3 - 2 * stepT);

            // Real physical distance: Steve steps back by 14.0 units
            skinViewer.playerObject.position.x = -14.0 * stepEase;

            // Torso aligns square to head: 0.58 rad -> Math.PI / 2 (90°)
            currentBodyYaw = 0.58 + ((Math.PI / 2) - 0.58) * stepEase;
            currentHeadYaw = (Math.PI / 2) - currentBodyYaw;

            // In Three.js: positive rotation.x swings leg BACKWARD (-Z local space)
            // Leg swings backward during step, and returns smoothly to 0 (both feet planted flat on ground)
            const swingPhase = Math.sin(stepT * Math.PI); // Peaks mid-step, exactly 0 at start and end
            rightLegRotX = swingPhase * 0.60;
            leftLegRotX  = -swingPhase * 0.25;
            rightArmRotX = swingPhase * 0.35;
            leftArmRotX  = -swingPhase * 0.35;
          }

          if (leftLeg) leftLeg.rotation.x = leftLegRotX;
          if (rightLeg) rightLeg.rotation.x = rightLegRotX;
          if (leftArm) {
            leftArm.rotation.x = leftArmRotX;
            leftArm.rotation.z = 0.04;
          }
          if (rightArm) {
            rightArm.rotation.x = rightArmRotX;
            rightArm.rotation.z = -0.04;
          }

          skinViewer.playerObject.rotation.y = currentBodyYaw;
          if (head) {
            head.rotation.y = currentHeadYaw;
            head.rotation.x = 0; // Flat level horizontal head
            head.rotation.z = 0;
          }

          // Keep 3D shadow locked under Steve's feet as he steps back
          if (skinViewer && skinViewer.scene) {
            const sShadow = skinViewer.scene.getObjectByName('steve_shadow_3d');
            if (sShadow) {
              sShadow.position.x = skinViewer.playerObject.position.x;
              sShadow.position.z = skinViewer.playerObject.position.z;
            }
          }

          if (elapsed >= totalAimTime) {
            try {
              // FIRE SHOTGUN!
              shotgunAnim.phase = 'firing';
              shotgunAnim.fireTime = now;

              // 1. Audio blast with sub-bass drop, 12-gauge distortion noise, bone crunch & skull fracture resonance
              playShotgunBlastComplete();

              // 2. Muzzle flash on
              if (shotgunAnim.flashGroup) {
                shotgunAnim.flashGroup.visible = true;
              }

              // 3. Screen shake & flash
              if (skinViewerCanvas) {
                skinViewerCanvas.style.filter = 'brightness(1.8)';
                skinViewerCanvas.style.transform = 'translate(-22px, -10px) rotate(-3.5deg)';
                setTimeout(() => {
                  if (skinViewerCanvas) skinViewerCanvas.style.filter = '';
                }, 90);
                setTimeout(() => {
                  if (skinViewerCanvas) skinViewerCanvas.style.transform = '';
                }, 220);
              }

              // 4. Shotgun kickback horizontally to the right
              if (shotgunAnim.shotgunGroup) {
                shotgunAnim.shotgunGroup.position.x += 10.5;
                shotgunAnim.shotgunGroup.rotation.z += 0.14;
              }

              // 5. Forend pump kickback along barrel axis
              if (shotgunAnim.pumpMesh) {
                shotgunAnim.pumpMesh.position.x -= 2.5;
                setTimeout(() => {
                  if (shotgunAnim.pumpMesh) shotgunAnim.pumpMesh.position.x += 2.5;
                }, 450);
              }

              // Hide flash after 140ms
              setTimeout(() => {
                if (shotgunAnim.flashGroup) shotgunAnim.flashGroup.visible = false;
              }, 140);

              // Remove shotgun from scene after 950ms
              setTimeout(() => {
                if (shotgunAnim.shotgunGroup && skinViewer && skinViewer.scene) {
                  skinViewer.scene.remove(shotgunAnim.shotgunGroup);
                  shotgunAnim.shotgunGroup = null;
                }
              }, 950);

              // 6. HEAD DESTRUCTION: The point-blank 12-gauge blast completely obliterates and shatters the head into pieces!
              const Vector3 = skinViewer.camera.position.constructor;
              const headWorldPos = new Vector3();
              head.getWorldPosition(headWorldPos);

              // Head is completely destroyed (no whole head remains intact!)
              head.visible = false;
              shotgunAnim.detachedHeadMesh = null;
              shotgunAnim.headDetached = false;

              // 7. ANATOMICAL DISMEMBERMENT & SKELETAL FRACTURES
              if (shotgunAnim.partsFactory) {
                const { BoxGeometry, Mesh, Material, Group } = shotgunAnim.partsFactory;
                const SafeGroup = Group || (skinViewer && skinViewer.scene && skinViewer.scene.constructor) || Object;

                // Neck stump with cervical vertebrae and shattered skull base
                if (torso) {
                  const stump = createShatteredSkullStump(BoxGeometry, Mesh, Material, SafeGroup);
                  stump.position.set(0, 6.0, 0);
                  torso.add(stump);
                  shotgunAnim.shatteredSkullStump = stump;

                  // Exposed ribcage with fractured ribs & spinal column inside chest
                  const ribcage = createExposedRibcage(BoxGeometry, Mesh, Material, SafeGroup);
                  ribcage.position.set(0, 1.0, 0);
                  torso.add(ribcage);
                  shotgunAnim.exposedRibcage = ribcage;
                }

                // Spawn ~30 flying anatomical skull, bone, jaw, teeth, eyeball, scalp & brain chunks
                const skullPieceTypes = [
                  'cranium_plate', 'cranium_plate', 'cranium_plate', 'cranium_plate', 'cranium_plate',
                  'eye_socket_bone', 'eye_socket_bone',
                  'jaw_with_teeth', 'jaw_with_teeth',
                  'eyeball', 'eyeball',
                  'scalp_chunk', 'scalp_chunk', 'scalp_chunk', 'scalp_chunk', 'scalp_chunk', 'scalp_chunk',
                  'brain_chunk', 'brain_chunk', 'brain_chunk', 'brain_chunk', 'brain_chunk',
                  'vertebra_bone', 'vertebra_bone', 'vertebra_bone',
                  'rib_bone', 'rib_bone', 'rib_bone', 'rib_bone', 'rib_bone', 'rib_bone',
                  'bone_shard', 'bone_shard', 'bone_shard', 'bone_shard', 'bone_shard', 'bone_shard', 'bone_shard', 'bone_shard'
                ];

                skullPieceTypes.forEach((type) => {
                  const isRib = type === 'rib_bone';
                  const spawnPos = {
                    x: headWorldPos.x + (Math.random() - 0.5) * 4,
                    y: (isRib ? headWorldPos.y - 6 : headWorldPos.y) + (Math.random() - 0.5) * 3,
                    z: headWorldPos.z + (Math.random() - 0.5) * 4
                  };

                  const { mesh, halfSize } = createDetailedSkullOrBoneMesh(type, BoxGeometry, Mesh, Material, SafeGroup);
                  mesh.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
                  mesh.rotation.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
                  skinViewer.scene.add(mesh);

                  shotgunAnim.goreChunks.push({
                    mesh: mesh,
                    vx: -16.0 - Math.random() * 24.0,
                    vy: 10.0 + Math.random() * 20.0,
                    vz: (Math.random() - 0.5) * 20.0,
                    rotVx: (Math.random() - 0.5) * 0.9,
                    rotVy: (Math.random() - 0.5) * 0.9,
                    rotVz: (Math.random() - 0.5) * 0.9,
                    halfSize: halfSize,
                    bounces: 0
                  });
                });
              }

              // 8. MASSIVE BLOOD FOUNTAIN (ДОХУИЩА КРОВИ): 140+ red voxel cubes erupt from neck stump!
              spawnBloodVoxels(headWorldPos, 140);
              shotgunAnim.bloodSpurtFrames = 48; // Continuous arterial spurt for next 48 frames

              // 9. NATURAL 3D RAGDOLL INITIALIZATION
              // Limbs transition from their standing pose into a limp, splayed ragdoll state
              shotgunAnim.ragdoll = {
                lArm: { x: (leftArm ? leftArm.rotation.x : 0), z: 0.04 },
                rArm: { x: (rightArm ? rightArm.rotation.x : 0), z: -0.04 },
                lLeg: { x: (leftLeg ? leftLeg.rotation.x : 0), z: 0 },
                rLeg: { x: (rightLeg ? rightLeg.rotation.x : 0), z: 0 },
                torso:{ x: 0 }
              };

              // 2x Stronger blast impulse: Steve is violently propelled backwards across the arena
              shotgunAnim.vx = -44.0;
              shotgunAnim.vy = -12.0; // Driven hard down into pedestal
              shotgunAnim.vz = -7.0;
              shotgunAnim.rotVx = 0.65;
              shotgunAnim.rotVy = 0.35;
              shotgunAnim.rotVz = 0.85;

              // Hide Steve 3D shadow while in flight
              if (skinViewer && skinViewer.scene) {
                const sShadow = skinViewer.scene.getObjectByName('steve_shadow_3d');
                if (sShadow) sShadow.visible = false;
              }

              shotgunAnim.phase = 'flying';
            } catch (blastErr) {
              console.error('Shotgun blast crash prevented:', blastErr);
              shotgunAnim.phase = 'flying';
            }
          }
        } else if (shotgunAnim.phase === 'flying') {
          // --- AUTHENTIC 3X SLOWER CINEMATIC FLIGHT (TIME_SCALE = 0.067) ---
          const slowMo = 0.067;

          // A. Natural limp ragdoll limb physics (limbs splay, trail behind blast, zero twitching / zero spinning)
          const rd = shotgunAnim.ragdoll;
          if (rd) {
            // Target angles: arms thrown backward and splayed outward by the blast, legs trailing behind
            const targetLArmX = -0.75;
            const targetLArmZ = 1.15;
            const targetRArmX = -0.70;
            const targetRArmZ = -1.15;

            const targetLLegX = 0.55;
            const targetLLegZ = -0.22;
            const targetRLegX = 0.65;
            const targetRLegZ = 0.22;

            const targetTorsoX = -0.25; // Spine snaps back from chest blast

            // Viscous joint damping: heavy limp limbs smoothly yield to blast inertia
            const dampFactor = 0.08 * (slowMo / 0.067);
            rd.lArm.x += (targetLArmX - rd.lArm.x) * dampFactor;
            rd.lArm.z += (targetLArmZ - rd.lArm.z) * (dampFactor * 1.1);

            rd.rArm.x += (targetRArmX - rd.rArm.x) * dampFactor;
            rd.rArm.z += (targetRArmZ - rd.rArm.z) * (dampFactor * 1.1);

            rd.lLeg.x += (targetLLegX - rd.lLeg.x) * dampFactor;
            rd.lLeg.z += (targetLLegZ - rd.lLeg.z) * dampFactor;

            rd.rLeg.x += (targetRLegX - rd.rLeg.x) * dampFactor;
            rd.rLeg.z += (targetRLegZ - rd.rLeg.z) * dampFactor;

            rd.torso.x += (targetTorsoX - rd.torso.x) * (dampFactor * 0.8);

            // Apply realistic limp ragdoll rotations
            if (leftArm) leftArm.rotation.set(rd.lArm.x, 0, rd.lArm.z);
            if (rightArm) rightArm.rotation.set(rd.rArm.x, 0, rd.rArm.z);
            if (leftLeg) leftLeg.rotation.set(rd.lLeg.x, 0, rd.lLeg.z);
            if (rightLeg) rightLeg.rotation.set(rd.rLeg.x, 0, rd.rLeg.z);
            if (torso) torso.rotation.set(rd.torso.x, 0, 0);
          }

          // B. Continuous arterial blood fountain from neck stump (zero allocations)
          if (shotgunAnim.bloodSpurtFrames > 0) {
            shotgunAnim.bloodSpurtFrames--;
            neckSpurtPos.x = skinViewer.playerObject.position.x - 2;
            neckSpurtPos.y = skinViewer.playerObject.position.y + 10;
            neckSpurtPos.z = skinViewer.playerObject.position.z;
            spawnBloodVoxels(neckSpurtPos, 6);
          }

          // C. Blood voxels simulation
          for (let i = 0; i < shotgunAnim.bloodParticles.length; i++) {
            const p = shotgunAnim.bloodParticles[i];
            p.position.x += p.userData.vx * slowMo;
            p.position.y += p.userData.vy * slowMo;
            p.position.z += p.userData.vz * slowMo;
            p.userData.vy -= 0.70 * slowMo; // Gravity on blood
            p.rotation.x += p.userData.rotX * slowMo;
            p.rotation.y += p.userData.rotY * slowMo;
            p.rotation.z += p.userData.rotZ * slowMo;

            // Blood splatters and settles at ground level
            if (p.position.y <= -14.0) {
              p.position.y = -14.0;
              p.userData.vy = 0;
              p.userData.vx *= 0.75;
              p.userData.vz *= 0.75;
            }
          }

          // D. Body 3D flight & tumble
          shotgunAnim.vx -= 7.5 * slowMo; // Accelerate leftwards across the full screen with 2x impulse
          skinViewer.playerObject.position.x += shotgunAnim.vx * slowMo;
          skinViewer.playerObject.position.y += shotgunAnim.vy * slowMo;
          skinViewer.playerObject.position.z += shotgunAnim.vz * slowMo;
          skinViewer.playerObject.rotation.x += shotgunAnim.rotVx * slowMo;
          skinViewer.playerObject.rotation.y += shotgunAnim.rotVy * slowMo;
          skinViewer.playerObject.rotation.z += shotgunAnim.rotVz * slowMo;
          shotgunAnim.vy -= 0.45 * slowMo;

          // Pedestal ground rebound (only while still directly over pedestal, feet on floor at y = -9.0)
          if (skinViewer.playerObject.position.x > -14 && skinViewer.playerObject.position.y <= -1.0) {
            skinViewer.playerObject.position.y = -1.0;
            shotgunAnim.vy = Math.abs(shotgunAnim.vy) * 0.45;
            if (rd) {
              rd.lLeg.x *= 0.5;
              rd.rLeg.x *= 0.5;
            }
          }

          // E. CRATE PYRAMID SMASH COLLISION: Steve hurtles into the crates at x <= 0.0!
          if (!crateCollided && skinViewer.playerObject.position.x <= 0.0) {
            crateCollided = true;
            playCrateSmashSound();
            if (skinViewer && skinViewer.scene) {
              const cShadow = skinViewer.scene.getObjectByName('crates_shadow_3d');
              if (cShadow) cShadow.visible = false;
            }
            crates.forEach((c, idx) => {
              c.vel.x = -16.0 - Math.random() * 12.0;
              c.vel.y = 8.0 + Math.random() * 8.0 + (idx === 2 ? 4.0 : 0);
              c.vel.z = (c.startPos.z || (idx === 0 ? -1 : 1)) * (3.0 + Math.random() * 4.0);
              c.rotVel.x = (Math.random() - 0.5) * 0.45;
              c.rotVel.y = (Math.random() - 0.5) * 0.45;
              c.rotVel.z = (Math.random() - 0.5) * 0.45;
              c.hit = true;
            });

            // Impact shockwave folds limbs on smash
            if (rd) {
              rd.lArm.x += 0.6;
              rd.rArm.x += 0.6;
              rd.lLeg.x -= 0.5;
              rd.rLeg.x -= 0.5;
            }
          }

          // F. Crates physical simulation & ground bounces
          crates.forEach((c) => {
            if (c.hit) {
              c.mesh.position.x += c.vel.x * slowMo;
              c.mesh.position.y += c.vel.y * slowMo;
              c.mesh.position.z += c.vel.z * slowMo;
              c.vel.y -= 0.65 * slowMo;
              c.mesh.rotation.x += c.rotVel.x * slowMo;
              c.mesh.rotation.y += c.rotVel.y * slowMo;
              c.mesh.rotation.z += c.rotVel.z * slowMo;

              if (c.mesh.position.x > -20 && c.mesh.position.y <= -8.8) {
                c.mesh.position.y = -8.8;
                c.vel.y = Math.abs(c.vel.y) * 0.40;
              }
            }
          });

          // G. Detailed anatomical bone & skull pieces simulation
          for (let i = 0; i < shotgunAnim.goreChunks.length; i++) {
            const chunk = shotgunAnim.goreChunks[i];
            chunk.mesh.position.x += chunk.vx * slowMo;
            chunk.mesh.position.y += chunk.vy * slowMo;
            chunk.mesh.position.z += chunk.vz * slowMo;
            chunk.vy -= 0.60 * slowMo;
            chunk.mesh.rotation.x += chunk.rotVx * slowMo;
            chunk.mesh.rotation.y += chunk.rotVy * slowMo;
            chunk.mesh.rotation.z += chunk.rotVz * slowMo;

            const floorY = -14.0 + chunk.halfSize;
            if (chunk.mesh.position.y <= floorY) {
              chunk.mesh.position.y = floorY;
              if (chunk.bounces < 5) {
                chunk.vy = Math.abs(chunk.vy) * 0.35;
                chunk.vx *= 0.65;
                chunk.vz *= 0.65;
                chunk.rotVx *= 0.6;
                chunk.rotVy *= 0.6;
                chunk.rotVz *= 0.6;
                chunk.bounces++;
              } else {
                chunk.vy = 0;
                chunk.vx *= 0.7;
                chunk.vz *= 0.7;
              }
            }
          }

          // H. Fullscreen 3D Body Off-Screen Boundary Check: Steve hurtles past left screen boundary or timeout
          const flyingDuration = now - shotgunAnim.fireTime;
          if (skinViewer.playerObject.position.x < -70 || flyingDuration >= 2400) {
            skinViewer.playerObject.visible = false;
            crates.forEach((c) => { c.mesh.visible = false; });
            if (shotgunAnim.detachedHeadMesh) shotgunAnim.detachedHeadMesh.visible = false;
            shotgunAnim.bloodParticles.forEach((p) => { p.visible = false; });
            shotgunAnim.goreChunks.forEach((c) => { c.mesh.visible = false; });
            shotgunAnim.phase = 'offscreen';
            shotgunAnim.offscreenStartTime = Date.now();
          }
        } else if (shotgunAnim.phase === 'offscreen') {
          // Steve remains completely off-screen for EXACTLY 5 seconds (5,000 ms)
          if (now - shotgunAnim.offscreenStartTime >= 5000) {
            // 5 SECONDS HAVE PASSED! Clean up blood and respawn Steve from the sky!
            shotgunAnim.phase = 'falling';
            shotgunAnim.fallVy = -2.0;

            // 1. Remove all blood voxels
            shotgunAnim.bloodParticles.forEach((p) => {
              if (skinViewer && skinViewer.scene) skinViewer.scene.remove(p);
            });
            shotgunAnim.bloodParticles = [];

            // 2. Dispose and remove all gore chunks
            shotgunAnim.goreChunks.forEach((c) => {
              if (skinViewer && skinViewer.scene) skinViewer.scene.remove(c.mesh);
              c.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
              });
            });
            shotgunAnim.goreChunks = [];

            // 3. Remove neck stump and exposed ribcage
            if (shotgunAnim.shatteredSkullStump && torso) {
              torso.remove(shotgunAnim.shatteredSkullStump);
              shotgunAnim.shatteredSkullStump.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
              });
              shotgunAnim.shatteredSkullStump = null;
            }
            if (shotgunAnim.exposedRibcage && torso) {
              torso.remove(shotgunAnim.exposedRibcage);
              shotgunAnim.exposedRibcage.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
              });
              shotgunAnim.exposedRibcage = null;
            }

            // 4. Reset crates pyramid back to original pristine state
            resetCratesPyramid();

            // 5. Clean up detached flying head & restore original head visibility
            if (shotgunAnim.detachedHeadMesh) {
              if (skinViewer && skinViewer.scene) skinViewer.scene.remove(shotgunAnim.detachedHeadMesh);
              shotgunAnim.detachedHeadMesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
              });
              shotgunAnim.detachedHeadMesh = null;
            }
            if (head) {
              head.visible = true;
              head.position.set(0, 0, 0);
              head.rotation.set(0, 0, 0);
            }
            shotgunAnim.headDetached = false;

            // 6. Drop Steve from high in the sky
            skinViewer.playerObject.position.set(0, 240, 0);
            skinViewer.playerObject.rotation.set(0, 0, 0);
            skinViewer.playerObject.visible = true;

            Object.keys(stevePhysics).forEach((k) => {
              stevePhysics[k].x = 0;
              stevePhysics[k].v = 0;
            });
          }
        } else if (shotgunAnim.phase === 'falling') {
          // Steve drops downwards with gravitational acceleration
          shotgunAnim.fallVy -= 2.6;
          skinViewer.playerObject.position.y += shotgunAnim.fallVy;

          // Arms and legs flail in the sky wind
          if (leftArm) leftArm.rotation.z = 0.85;
          if (rightArm) rightArm.rotation.z = -0.85;
          if (head) head.rotation.x = -0.4;
          if (leftLeg) leftLeg.rotation.x = -0.35;
          if (rightLeg) rightLeg.rotation.x = 0.35;

          if (skinViewer.playerObject.position.y <= -0.5) {
            // HIT THE PEDESTAL!
            skinViewer.playerObject.position.y = -0.5;
            skinViewer.playerObject.position.x = 0;
            skinViewer.playerObject.position.z = 0;
            skinViewer.playerObject.rotation.set(0, 0, 0);
            if (head) {
              head.rotation.set(0, 0, 0);
              head.position.set(0, 0, 0);
            }
            if (torso) {
              torso.rotation.set(0, 0, 0);
              torso.position.set(0, -6, 0);
            }
            if (leftLeg) {
              leftLeg.rotation.set(0, 0, 0);
              leftLeg.position.set(1.9, -12, -0.1);
            }
            if (rightLeg) {
              rightLeg.rotation.set(0, 0, 0);
              rightLeg.position.set(-1.9, -12, -0.1);
            }
            if (leftArm) {
              leftArm.rotation.set(0, 0, 0);
              leftArm.position.set(5, -2, 0);
            }
            if (rightArm) {
              rightArm.rotation.set(0, 0, 0);
              rightArm.position.set(-5, -2, 0);
            }
            steveSpinVelocity = 0;
            steveBodyRotationY = 0;
            limbGlitchFactor = 0;
            shotgunAnim.ragdoll = null;
            shotgunAnim.phase = 'idle';
            isShotgunActive = false;

            // Restore Steve 3D shadow under feet
            if (skinViewer && skinViewer.scene) {
              const sShadow = skinViewer.scene.getObjectByName('steve_shadow_3d');
              if (sShadow) sShadow.visible = true;
            }

            // Soft landing sound
            playMinecraftLandingSound();

            // Spring rebound landing!
            stevePhysics.recoilY.v = -4.2;
            stevePhysics.bodyPitch.v = 0.50;
            stevePhysics.lLegPitch.v = -0.55;
            stevePhysics.rLegPitch.v = -0.55;
            stevePhysics.lArmRoll.v = 0.65;
            stevePhysics.rArmRoll.v = -0.65;
            stevePhysics.headPitch.v = 0.30;
          }
        }
      } else {
        // --- NATURAL BREATHING & SPRING PHYSICS SIMULATION ---
        skinViewer.playerObject.position.x += (0 - skinViewer.playerObject.position.x) * 0.15;

        // 1. Natural cursor-follow interpolation
        currentHeadYaw += (targetHeadYaw - currentHeadYaw) * 0.12;
        currentHeadPitch += (targetHeadPitch - currentHeadPitch) * 0.12;

        // 2. Step all spring degrees of freedom
        Object.keys(stevePhysics).forEach((k) => stepSpringDOF(stevePhysics[k]));

        // 3. Spinning inertia & Shortest-direction Return
        steveSpinVelocity *= 0.88;
        steveBodyRotationY += steveSpinVelocity;
        steveBodyRotationY = normalizeAngle(steveBodyRotationY);

        // When not dragging, rotate smoothly to front (0 rad) along the shortest path (max half-turn)
        if (!isDraggingSteve && Math.abs(steveSpinVelocity) < 0.008) {
          steveBodyRotationY += (0 - steveBodyRotationY) * 0.12;
          if (Math.abs(steveBodyRotationY) < 0.001) steveBodyRotationY = 0;
        }
        skinViewer.playerObject.rotation.y = steveBodyRotationY;

        // 4. Stretch physics: activates ONLY when pulled strongly downwards or jerked violently
        // Normal horizontal spinning leaves limbs 100% attached, solid and stable!
        const targetGlitch = Math.min(1.0, Math.max(0, targetLimbStretch));
        limbGlitchFactor += (targetGlitch - limbGlitchFactor) * 0.22;

        if (limbGlitchFactor > 0.01) {
          const gf = limbGlitchFactor;
          const jp = simTime * 35;

          // Head unglues upward slightly with subtle jiggle (max ~2.2 units)
          if (head) {
            head.position.y = 0 + gf * 2.2 + Math.sin(jp) * gf * 0.35;
            head.position.x = Math.sin(jp * 0.7) * gf * 0.4;
            head.position.z = Math.cos(jp * 0.7) * gf * 0.4;
          }

          // Arms unglue and stretch outward/downward slightly (max ~2.5 units out, ~1.8 units down)
          if (leftArm) {
            leftArm.position.x = 5.0 + gf * 2.5 + Math.sin(jp * 1.1) * gf * 0.35;
            leftArm.position.y = -2.0 - gf * 1.8 + Math.cos(jp * 0.9) * gf * 0.35;
            leftArm.position.z = Math.sin(jp) * gf * 0.35;
          }

          if (rightArm) {
            rightArm.position.x = -5.0 - gf * 2.5 - Math.sin(jp * 1.1) * gf * 0.35;
            rightArm.position.y = -2.0 - gf * 1.8 + Math.cos(jp * 0.9) * gf * 0.35;
            rightArm.position.z = Math.cos(jp) * gf * 0.35;
          }

          // Legs unglue downward and apart slightly (max ~2.2 units down, ~1.2 units out)
          if (leftLeg) {
            leftLeg.position.x = 1.9 + gf * 1.2 + Math.sin(jp * 0.8) * gf * 0.25;
            leftLeg.position.y = -12.0 - gf * 2.2;
            leftLeg.position.z = -0.1 + Math.sin(jp * 0.9) * gf * 0.25;
          }

          if (rightLeg) {
            rightLeg.position.x = -1.9 - gf * 1.2 - Math.sin(jp * 0.8) * gf * 0.25;
            rightLeg.position.y = -12.0 - gf * 2.2;
            rightLeg.position.z = -0.1 + Math.cos(jp * 0.9) * gf * 0.25;
          }

          // Torso subtle jitter
          if (torso) {
            torso.position.x = Math.sin(jp * 1.4) * gf * 0.2;
            torso.position.y = -6.0 + Math.cos(jp * 1.4) * gf * 0.2;
          }
        } else {
          // Snap back cleanly to default sockets
          if (head) head.position.set(0, 0, 0);
          if (leftArm) leftArm.position.set(5, -2, 0);
          if (rightArm) rightArm.position.set(-5, -2, 0);
          if (leftLeg) leftLeg.position.set(1.9, -12, -0.1);
          if (rightLeg) rightLeg.position.set(-1.9, -12, -0.1);
          if (torso) torso.position.set(0, -6, 0);
        }

        // 5. Authentic Minecraft Hurt Red Flash directly on Steve's 3D skin materials
        if (steveHurtFlash > 0.01) {
          steveHurtFlash *= 0.86;
          const redEmissive = steveHurtFlash * 0.95;
          const redColorTint = 1.0 - steveHurtFlash * 0.65;
          if (skinViewer && skinViewer.playerObject && skinViewer.playerObject.skin) {
            const s = skinViewer.playerObject.skin;
            const mats = [s.layer1Material, s.layer2Material, s.layer1MaterialBiased, s.layer2MaterialBiased];
            mats.forEach((m) => {
              if (m) {
                m.emissive.setRGB(redEmissive, 0, 0);
                m.color.setRGB(1.0, redColorTint, redColorTint);
              }
            });
          }
        } else if (steveHurtFlash > 0) {
          steveHurtFlash = 0;
          if (skinViewer && skinViewer.playerObject && skinViewer.playerObject.skin) {
            const s = skinViewer.playerObject.skin;
            const mats = [s.layer1Material, s.layer2Material, s.layer1MaterialBiased, s.layer2MaterialBiased];
            mats.forEach((m) => {
              if (m) {
                m.emissive.setRGB(0, 0, 0);
                m.color.setRGB(1.0, 1.0, 1.0);
              }
            });
          }
        }

        // 5. Gentle sinusoidal idle breathing
        const breath = Math.sin(simTime * 1.5) * 0.024;
        const armSway = Math.sin(simTime * 1.1) * 0.032;

        // 6. Apply spring displacement + breathing to 3D bones
        if (head) {
          head.rotation.y = currentHeadYaw + stevePhysics.headYaw.x;
          head.rotation.x = currentHeadPitch + stevePhysics.headPitch.x;
          head.rotation.z = stevePhysics.headRoll.x;
        }

        if (torso) {
          torso.rotation.x = breath + stevePhysics.bodyPitch.x;
          torso.rotation.y = stevePhysics.bodyYaw.x;
          torso.rotation.z = stevePhysics.bodyRoll.x;
        }

        if (leftArm) {
          leftArm.rotation.x = armSway + stevePhysics.lArmPitch.x;
          leftArm.rotation.y = stevePhysics.lArmYaw.x;
          leftArm.rotation.z = Math.abs(breath) * 0.5 + stevePhysics.lArmRoll.x;
        }

        if (rightArm) {
          rightArm.rotation.x = -armSway + stevePhysics.rArmPitch.x;
          rightArm.rotation.y = stevePhysics.rArmYaw.x;
          rightArm.rotation.z = -Math.abs(breath) * 0.5 + stevePhysics.rArmRoll.x;
        }

        if (leftLeg) {
          leftLeg.rotation.x = stevePhysics.lLegPitch.x;
          leftLeg.rotation.z = stevePhysics.lLegRoll.x;
        }

        if (rightLeg) {
          rightLeg.rotation.x = stevePhysics.rLegPitch.x;
          rightLeg.rotation.z = stevePhysics.rLegRoll.x;
        }

        // 7. Whole body translation and tilt (base x = 0, base y = -0.5)
        skinViewer.playerObject.position.x = 0 + stevePhysics.recoilX.x;
        skinViewer.playerObject.position.y = -0.5 + stevePhysics.recoilY.x;
        skinViewer.playerObject.position.z = Math.max(-1.0, Math.min(1.0, stevePhysics.recoilZ.x));
        skinViewer.playerObject.rotation.z = stevePhysics.tiltZ.x;

        if (skinViewer && skinViewer.scene) {
          const sShadow = skinViewer.scene.getObjectByName('steve_shadow_3d');
          if (sShadow) {
            sShadow.position.x = skinViewer.playerObject.position.x;
            sShadow.position.z = skinViewer.playerObject.position.z;
          }
        }
      }
      updateSteveUIPositions();
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
  if (stagePlayerNick && !isEditingNametag) stagePlayerNick.textContent = clean;
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
  const activeTag = selectedEngineTag || currentVersionsData?.activeVersion || 'v0.2.97';
  if (!currentVersionsData || !currentVersionsData.versions) {
    return { tag: 'v0.2.97', name: 'Horizon 0.2.97', status: 'Релиз', supportedMcVersions: ['26.3'], defaultMcVersion: '26.3', isInstalled: true, isActive: true };
  }
  return currentVersionsData.versions.find((v) => v.tag === activeTag) || currentVersionsData.versions[0] || { tag: 'v0.2.97', name: 'Horizon 0.2.97', status: 'Релиз', supportedMcVersions: ['26.3'], defaultMcVersion: '26.3', isInstalled: true, isActive: true };
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

  selectedEngineTag = currentVersionsData?.activeVersion || 'v0.2.97';
  const activeVer = getCurrentVersionObj();
  const supported = (activeVer?.supportedMcVersions && activeVer.supportedMcVersions.length > 0)
    ? activeVer.supportedMcVersions
    : ['26.3'];

  // Default to maximum supported Minecraft version if none or unsupported
  if (!selectedMcVersion || !supported.includes(selectedMcVersion)) {
    selectedMcVersion = currentVersionsData?.selectedMcVersion || activeVer?.defaultMcVersion || supported[supported.length - 1] || '26.3';
  }

  renderMcVersionDropdown();
  renderEngineVersionDropdown();
  updateDockForVersion(activeVer);
}

function renderMcVersionDropdown() {
  if (!menuMcVersions) return;
  menuMcVersions.innerHTML = '';

  const activeVer = getCurrentVersionObj();
  const supported = (activeVer?.supportedMcVersions && activeVer.supportedMcVersions.length > 0)
    ? activeVer.supportedMcVersions
    : (currentVersionsData?.minecraftVersions?.map(v => v.id) || ['26.3']);

  if (!supported.includes(selectedMcVersion)) {
    selectedMcVersion = activeVer?.defaultMcVersion || supported[supported.length - 1] || '26.3';
  }

  if (selectedMcVersionLabel) {
    selectedMcVersionLabel.textContent = `Minecraft ${selectedMcVersion}`;
  }

  supported.forEach((mcVer) => {
    const isSelected = mcVer === selectedMcVersion;
    const item = document.createElement('div');
    item.className = `select-item type-stable ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <span style="font-weight:700; font-size:12px; color:#f8fafc;">Minecraft ${escapeHtml(mcVer)}</span>
        <span style="font-size:10px; color:var(--text-muted);">Поддержка Horizon</span>
      </div>
      ${isSelected ? '<span style="font-size:11px; color:#10b981;">✓</span>' : ''}
    `;

    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      menuMcVersions.classList.remove('open');
      selectedMcVersion = mcVer;
      if (selectedMcVersionLabel) {
        selectedMcVersionLabel.textContent = `Minecraft ${selectedMcVersion}`;
      }
      try {
        await window.api.setVersion(selectedEngineTag, selectedMcVersion);
      } catch (_) {}
      renderMcVersionDropdown();
    });

    menuMcVersions.appendChild(item);
  });
}

function renderEngineVersionDropdown() {
  if (!menuEngineVersions) return;
  menuEngineVersions.innerHTML = '';

  const versions = currentVersionsData?.versions || [];
  const activeVer = getCurrentVersionObj();

  if (selectedEngineVersionLabel) {
    selectedEngineVersionLabel.textContent = activeVer?.name || (selectedEngineTag ? `Horizon ${selectedEngineTag}` : 'Horizon 0.2.97');
  }

  versions.forEach((ver) => {
    const isSelected = ver.tag === (selectedEngineTag || activeVer?.tag);
    const isNightly = Boolean(ver.prerelease || ver.channel === 'nightly');
    const badgeText = isNightly ? 'Nightly' : 'Релиз';
    const badgeColor = isNightly ? '#f59e0b' : '#10b981';

    const item = document.createElement('div');
    item.className = `select-item type-${isNightly ? 'nightly' : 'stable'} ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px; min-width:0;">
        <span style="font-size:12px; font-weight:700; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${escapeHtml(ver.name || ver.tag)}
        </span>
        <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(ver.tag)}</span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <span style="font-size:9px; font-weight:800; color:${badgeColor}; background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:4px; letter-spacing:0.5px;">
          ${badgeText}
        </span>
        ${ver.isInstalled ? '<span style="font-size:11px; color:#10b981;" title="Установлена">✓</span>' : ''}
      </div>
    `;

    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      menuEngineVersions.classList.remove('open');
      selectedEngineTag = ver.tag;

      // Update supported Minecraft versions for this Horizon release (defaults to maximum supported version)
      const supported = ver.supportedMcVersions && ver.supportedMcVersions.length > 0 ? ver.supportedMcVersions : ['26.3'];
      selectedMcVersion = ver.defaultMcVersion || supported[supported.length - 1] || '26.3';

      try {
        await window.api.setVersion(selectedEngineTag, selectedMcVersion);
      } catch (_) {}

      renderEngineVersionDropdown();
      renderMcVersionDropdown();
      updateDockForVersion(ver);
    });

    menuEngineVersions.appendChild(item);
  });
}

function updateDockForVersion(ver) {
  const dockVersionBadgeName = document.getElementById('dock-version-badge-name');
  const dockVersionBadgeTag = document.getElementById('dock-version-badge-tag');
  if (dockVersionBadgeName && ver) {
    dockVersionBadgeName.textContent = ver.name || 'Horizon 26.3 Mobile';
  }
  if (dockVersionBadgeTag && ver) {
    dockVersionBadgeTag.textContent = ver.tag || 'v0.2.97';
  }

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
    heroBtnText.textContent = 'В БОЙ';
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

// --- GAME MODE SELECTION (Singleplayer vs PVP) ---
let selectedGameMode = 'singleplayer';
document.querySelectorAll('.mode-card[data-mode]').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card[data-mode]').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedGameMode = card.getAttribute('data-mode') || 'singleplayer';
  });
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

  // Pre-flight check: ensure launcher version is not blocked before launching game
  try {
    const updateInfo = await window.api.checkLauncherUpdate();
    if (updateInfo && updateInfo.isBlocked) {
      await checkLauncherUpdatesAndBroadcasts();
      return;
    }
  } catch (_) {}

  if (!ver || !ver.isInstalled) {
    await startVersionDownload(activeTag);
    return;
  }

  let srv = targetServer;
  if (!srv && selectedGameMode === 'pvp') {
    srv = inputPlayServer?.value || '127.0.0.1:25565';
  }

  await launchGame(srv);
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
      name: 'Ванилла Rust',
      version: '26.3',
      isDefault: true,
      description: 'Чистый официальный клиент Horizon 0.2.97 (Rust Client)',
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

// --- MODPACKS & CUSTOM ASSEMBLIES MANAGER (HORIZON RUST 26.3) ---
let dragSourceIndex = null;
let creationState = {
  activeCat: 'mods',
  name: '',
  mods: [],
  texturepacks: [],
  shaders: []
};

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

function showModpackSubView(viewName) {
  if (viewModpackList) viewModpackList.style.display = viewName === 'list' ? 'flex' : 'none';
  if (viewModpackCreate) viewModpackCreate.style.display = viewName === 'create' ? 'block' : 'none';
}

btnBackFromCreate?.addEventListener('click', () => {
  showModpackSubView('list');
  renderModpacksList();
});

document.getElementById('btn-cancel-create-pack')?.addEventListener('click', () => {
  showModpackSubView('list');
  renderModpacksList();
});

// Render assemblies grid (Vanilla + user-created packs + "+" card)
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
      <div class="modpack-card-badge">${pack.isDefault ? 'СТАНДАРТ' : 'ПОЛЬЗОВАТЕЛЬСКАЯ'}</div>
      <div class="modpack-card-title" title="${pack.name}">${pack.name}</div>

      <div class="modpack-card-stats">
        <div class="modpack-card-stat-line">
          <span>Моды:</span>
          <span>${modsCount}</span>
        </div>
        <div class="modpack-card-stat-line">
          <span>Текстурпаки:</span>
          <span>${texCount}</span>
        </div>
        <div class="modpack-card-stat-line">
          <span>Шейдеры:</span>
          <span>${shaCount}</span>
        </div>
      </div>

      <div class="modpack-card-actions">
        <button class="btn-pack-select ${isActive ? 'is-active' : ''}" data-select-pack="${pack.id}">
          ${isActive ? 'АКТИВНА' : 'ВЫБРАТЬ'}
        </button>
        ${
          !pack.isDefault
            ? `<button class="btn-pack-delete" data-delete-pack="${pack.id}" title="Удалить сборку">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
               </button>`
            : ''
        }
      </div>
    `;

    const selectBtn = card.querySelector('button[data-select-pack]');
    if (selectBtn && !isActive) {
      selectBtn.addEventListener('click', async () => {
        currentSettings.activeModpackId = pack.id;
        await window.api.saveSettings(currentSettings);
        updateDockModpackUI();
        renderModpacksList();
        showToast(`Выбрана сборка ${pack.name}`);
      });
    }

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
          showToast(`Сборка ${pack.name} удалена`);
        }
      });
    }

    modpackCardsContainer.appendChild(card);
  });

  // EXACT-SIZE "+" RECTANGULAR CARD
  const addCard = document.createElement('div');
  addCard.className = 'modpack-add-card';
  addCard.id = 'btn-card-create-pack';
  addCard.innerHTML = `
    <div class="add-card-icon-box">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
    <div class="add-card-title">Создать сборку</div>
  `;
  addCard.addEventListener('click', () => {
    openCreateModpackWorkbench();
  });
  modpackCardsContainer.appendChild(addCard);
}

// Open Creation Studio Workbench
function openCreateModpackWorkbench() {
  const packs = getModpacks();
  creationState = {
    activeCat: 'mods',
    name: `Сборка ${packs.length + 1}`,
    mods: [],
    texturepacks: [],
    shaders: []
  };

  const inputName = document.getElementById('input-new-pack-name');
  if (inputName) inputName.value = creationState.name;

  const searchInput = document.getElementById('input-addon-search');
  if (searchInput) searchInput.value = '';

  showModpackSubView('create');
  renderCreationWorkbench();
}

// Category tabs click listeners in Creation Studio
document.getElementById('tab-cat-mods')?.addEventListener('click', () => {
  creationState.activeCat = 'mods';
  renderCreationWorkbench();
});
document.getElementById('tab-cat-textures')?.addEventListener('click', () => {
  creationState.activeCat = 'textures';
  renderCreationWorkbench();
});
document.getElementById('tab-cat-shaders')?.addEventListener('click', () => {
  creationState.activeCat = 'shaders';
  renderCreationWorkbench();
});

// Render Creation Studio Workbench UI
function renderCreationWorkbench() {
  // 1. Highlight Category Tabs
  const tabMods = document.getElementById('tab-cat-mods');
  const tabTex = document.getElementById('tab-cat-textures');
  const tabSha = document.getElementById('tab-cat-shaders');

  tabMods?.classList.toggle('active', creationState.activeCat === 'mods');
  tabTex?.classList.toggle('active', creationState.activeCat === 'textures');
  tabSha?.classList.toggle('active', creationState.activeCat === 'shaders');

  // 2. Badges count
  const badgeMods = document.getElementById('badge-cat-mods');
  const badgeTex = document.getElementById('badge-cat-textures');
  const badgeSha = document.getElementById('badge-cat-shaders');
  if (badgeMods) badgeMods.textContent = String(creationState.mods.length);
  if (badgeTex) badgeTex.textContent = String(creationState.texturepacks.length);
  if (badgeSha) badgeSha.textContent = String(creationState.shaders.length);

  // 3. Dropzone labels according to active category
  const dragHint = document.getElementById('drag-drop-hint');
  const lblCatFiles = document.getElementById('label-current-cat-files');

  if (creationState.activeCat === 'mods') {
    if (dragHint) dragHint.textContent = 'Формат: .hmod';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ МОДОВ (${creationState.mods.length}):`;
  } else if (creationState.activeCat === 'textures') {
    if (dragHint) dragHint.textContent = 'Формат: .hpack, .zip';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ ТЕКСТУР (${creationState.texturepacks.length}):`;
  } else if (creationState.activeCat === 'shaders') {
    if (dragHint) dragHint.textContent = 'Формат: .hshader, .zip';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ ШЕЙДЕРОВ (${creationState.shaders.length}):`;
  }

  // 4. Render Reorderable List of Files in Current Category
  const fileListContainer = document.getElementById('current-cat-file-list');
  const searchInput = document.getElementById('input-addon-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  if (fileListContainer) {
    fileListContainer.innerHTML = '';
    const currentList = creationState[creationState.activeCat] || [];

    if (currentList.length === 0) {
      fileListContainer.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 24px 10px;">
          Список пуст. Перетащите файлы сюда или нажмите «Выбрать файл с ПК».
        </div>
      `;
    } else {
      currentList.forEach((fileKey, realIndex) => {
        // Apply search filter if query is present
        if (query && !fileKey.toLowerCase().includes(query)) {
          return;
        }

        const row = document.createElement('div');
        row.className = 'file-addon-row';
        row.setAttribute('draggable', 'true');

        const ext = fileKey.includes('.') ? fileKey.split('.').pop() : 'файл';

        row.innerHTML = `
          <div class="drag-handle-btn" title="Потяните для смены очереди">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          </div>
          <span class="file-addon-queue-num">#${realIndex + 1}</span>
          <span class="file-addon-name" title="${fileKey}">${fileKey}</span>
          <span class="file-addon-tag">.${ext}</span>
          <button class="file-addon-del" title="Удалить из очереди" data-del-idx="${realIndex}">Удалить</button>
        `;

        // Reordering Drag and Drop listeners
        row.addEventListener('dragstart', (e) => {
          dragSourceIndex = realIndex;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(realIndex));
          row.classList.add('dragging');
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          row.classList.add('drag-target');
        });

        row.addEventListener('dragleave', () => {
          row.classList.remove('drag-target');
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          row.classList.remove('drag-target');

          // If internal reordering
          if (dragSourceIndex !== null && dragSourceIndex !== realIndex) {
            const list = creationState[creationState.activeCat];
            const [movedItem] = list.splice(dragSourceIndex, 1);
            list.splice(realIndex, 0, movedItem);
            dragSourceIndex = null;
            renderCreationWorkbench();
          }
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          dragSourceIndex = null;
        });

        // Delete button listener
        row.querySelector('.file-addon-del').addEventListener('click', (e) => {
          e.stopPropagation();
          creationState[creationState.activeCat].splice(realIndex, 1);
          renderCreationWorkbench();
        });

        fileListContainer.appendChild(row);
      });
    }
  }

  // 5. Summary in Footer Bar
  const sMods = document.getElementById('summary-mods-badge');
  const sTex = document.getElementById('summary-tex-badge');
  const sSha = document.getElementById('summary-sha-badge');
  if (sMods) sMods.textContent = `${creationState.mods.length} модов`;
  if (sTex) sTex.textContent = `${creationState.texturepacks.length} текстурпаков`;
  if (sSha) sSha.textContent = `${creationState.shaders.length} шейдеров`;
}

// Search input listener (filters the current list in real time)
document.getElementById('input-addon-search')?.addEventListener('input', () => {
  renderCreationWorkbench();
});

// Native file picker button
document.getElementById('btn-pick-custom-file')?.addEventListener('click', async () => {
  let extensions = ['hmod'];
  let title = 'Выберите мод (.hmod)';

  if (creationState.activeCat === 'textures') {
    extensions = ['hpack', 'zip'];
    title = 'Выберите текстурпак (.hpack, .zip)';
  } else if (creationState.activeCat === 'shaders') {
    extensions = ['hshader', 'zip'];
    title = 'Выберите шейдер (.hshader, .zip)';
  }

  const selectedPath = await window.api.selectFile({
    title,
    filters: [{ name: 'Файлы дополнений', extensions }]
  });

  if (selectedPath) {
    const res = await window.api.importModFile(selectedPath);
    if (res && res.success) {
      creationState[creationState.activeCat].push(res.filename);
      showToast(`Файл ${res.filename} добавлен в очередь`);
      renderCreationWorkbench();
    } else {
      showToast(`Ошибка: ${res?.error || 'Не удалось прочитать файл'}`);
    }
  }
});

// Drag and drop handler for adding external files from OS
const dropBox = document.getElementById('modpack-drag-drop');
if (dropBox) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.classList.add('drag-over');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.classList.remove('drag-over');
    });
  });

  dropBox.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropBox.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name || '').split('.').pop().toLowerCase();
      let targetCat = creationState.activeCat;

      if (ext === 'hmod') targetCat = 'mods';
      else if (ext === 'hpack') targetCat = 'textures';
      else if (ext === 'hshader') targetCat = 'shaders';

      const res = await window.api.importModFile(file.path);
      if (res && res.success) {
        creationState[targetCat].push(res.filename);
        showToast(`Файл ${res.filename} добавлен`);
      } else {
        showToast(`Ошибка: ${res?.error || 'Не удалось скопировать'}`);
      }
    }

    renderCreationWorkbench();
  });
}

// Save & Select new custom assembly
document.getElementById('btn-save-new-pack')?.addEventListener('click', async () => {
  const inputName = document.getElementById('input-new-pack-name');
  const name = inputName?.value.trim() || `Сборка ${getModpacks().length + 1}`;
  const newId = `pack-${Date.now()}`;

  const newPack = {
    id: newId,
    name,
    version: '26.3',
    isDefault: false,
    mods: [...creationState.mods],
    texturepacks: [...creationState.texturepacks],
    shaders: [...creationState.shaders]
  };

  if (!currentSettings.modpacks) currentSettings.modpacks = getModpacks();
  currentSettings.modpacks.push(newPack);
  currentSettings.activeModpackId = newId;

  await window.api.saveSettings(currentSettings);
  updateDockModpackUI();
  modalModpacks?.classList.remove('open');
  showToast(`Сборка ${newPack.name} сохранена`);
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
const settingTouchHaptic = document.getElementById('setting-touch-haptic');
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
    if (settingTouchHaptic) settingTouchHaptic.checked = s.haptic_feedback !== false;
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
    haptic_feedback: Boolean(settingTouchHaptic?.checked),
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

// --- ANDROID APK EXPORT HANDLER ---
const btnExportApk = document.getElementById('btn-export-apk');

btnExportApk?.addEventListener('click', async () => {
  playUiClickSound();
  if (btnExportApk) {
    btnExportApk.disabled = true;
    btnExportApk.textContent = 'Сборка APK...';
  }
  try {
    const res = await window.api.exportAndroidApk();
    if (res.success) {
      if (btnExportApk) {
        btnExportApk.textContent = 'Готово!';
        setTimeout(() => { if (btnExportApk) { btnExportApk.disabled = false; btnExportApk.textContent = 'Собрать APK'; } }, 3000);
      }
      if (res.adbDevice) {
        showCustomAlert('APK успешно собран!', `Пакет сохранен в ${res.path}\n\nОбнаружено Android устройство (${res.adbDevice}). Нажмите "ОК" для установки.`);
        const installRes = await window.api.installAdbApk();
        if (installRes.success) {
          showCustomAlert('Успешно установлено!', `Игра успешно установлена на устройство ${res.adbDevice} через ADB!`);
        }
      } else {
        showCustomAlert('APK успешно собран!', `Пакет с предустановленным сенсорным управлением сохранен в:\n${res.path}\n\nВы можете скопировать его на телефон или установить через adb install.`);
      }
    } else {
      if (btnExportApk) {
        btnExportApk.disabled = false;
        btnExportApk.textContent = 'Собрать APK';
      }
      showCustomAlert('Ошибка сборки', res.error || 'Не удалось скомпилировать APK');
    }
  } catch (err) {
    if (btnExportApk) {
      btnExportApk.disabled = false;
      btnExportApk.textContent = 'Собрать APK';
    }
    showCustomAlert('Ошибка', err.message);
  }
});

// --- AUDIO & HAPTIC FEEDBACK SYNTHESIZER ---
// audioCtx already declared above
function triggerHapticFeedback() {
  if (settingTouchHaptic && !settingTouchHaptic.checked) return;
  try {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }
  } catch (_) {}
}

function playUiClickSound() {
  triggerHapticFeedback();
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

  // 6. Off-hand SWAP Button beside Hotbar
  const swapSize = 18 * scale;
  const swapX = hotbarX - swapSize - 6;
  const swapY = hotbarY;

  simCtx.fillStyle = baseFill;
  simCtx.beginPath();
  simCtx.roundRect(swapX, swapY, swapSize, swapSize, 4);
  simCtx.fill();
  simCtx.strokeStyle = baseStroke;
  simCtx.stroke();
  simCtx.fillStyle = '#ffffff';
  simCtx.font = `bold ${Math.round(8 * scale)}px sans-serif`;
  simCtx.fillText('⇄', swapX + swapSize / 2, swapY + swapSize / 2);

  // 7. Mining circular indicator if holding right side
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

      // Check off-hand swap button
      const hotbarW = 160 * scale;
      const hotbarH = 18 * scale;
      const hotbarX = (simCanvas.width - hotbarW) / 2;
      const hotbarY = simCanvas.height - hotbarH - 4;
      const swapSize = 18 * scale;
      const swapX = hotbarX - swapSize - 6;
      const swapY = hotbarY;
      if (x >= swapX && x <= swapX + swapSize && y >= swapY && y <= swapY + swapSize) {
        playUiClickSound();
        if (simFeedback) simFeedback.textContent = 'Действие: Смена руки (F / Вторая рука)';
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

// Remote Launcher Updates & Broadcast Announcements
async function checkLauncherUpdatesAndBroadcasts() {
  try {
    // 1. Check Launcher Version & Remote Block
    const updateInfo = await window.api.checkLauncherUpdate();
    if (updateInfo) {
      if (updateInfo.isBlocked) {
        // Hard block: user cannot close this modal, play button is disabled
        const modalBlocked = document.getElementById('modal-version-blocked');
        const titleEl = document.getElementById('blocked-modal-title');
        const msgEl = document.getElementById('blocked-modal-message');
        const btnDl = document.getElementById('btn-blocked-download');

        if (titleEl && updateInfo.blockedTitle) titleEl.textContent = updateInfo.blockedTitle;
        if (msgEl && updateInfo.blockedMessage) msgEl.textContent = updateInfo.blockedMessage;

        if (btnDl) {
          btnDl.onclick = () => {
            window.api.openExternalUrl(updateInfo.downloadUrl || 'https://burmalda.ru');
          };
        }

        if (btnHeroAction) {
          btnHeroAction.disabled = true;
          btnHeroAction.style.opacity = '0.5';
          btnHeroAction.style.cursor = 'not-allowed';
        }

        if (modalBlocked) modalBlocked.style.display = 'flex';
        return; // Stop further checks if blocked
      } else if (updateInfo.hasUpdate) {
        // Soft update notification
        const modalUpdate = document.getElementById('modal-version-update');
        const titleEl = document.getElementById('update-modal-title');
        const msgEl = document.getElementById('update-modal-message');
        const btnDl = document.getElementById('btn-update-download');
        const btnDismiss = document.getElementById('btn-update-dismiss');

        if (titleEl && updateInfo.title) titleEl.textContent = updateInfo.title;
        if (msgEl && updateInfo.message) msgEl.textContent = updateInfo.message;

        if (btnDl) {
          btnDl.onclick = () => {
            window.api.openExternalUrl(updateInfo.downloadUrl || 'https://burmalda.ru');
            if (modalUpdate) modalUpdate.style.display = 'none';
          };
        }
        if (btnDismiss) {
          btnDismiss.onclick = () => {
            if (modalUpdate) modalUpdate.style.display = 'none';
          };
        }

        if (modalUpdate) modalUpdate.style.display = 'flex';
      }
    }

    // 2. Check Remote Broadcast Message (Alert to players)
    const broadcast = await window.api.checkBroadcastMessage();
    if (broadcast && broadcast.hasMessage) {
      const lastDismissed = sessionStorage.getItem('dismissed_broadcast_id');
      if (lastDismissed !== broadcast.id) {
        const modalBcast = document.getElementById('modal-broadcast');
        const titleEl = document.getElementById('broadcast-modal-title');
        const msgEl = document.getElementById('broadcast-modal-message');
        const btnClose = document.getElementById('btn-broadcast-close');
        const btnAction = document.getElementById('btn-broadcast-action');

        if (titleEl && broadcast.title) titleEl.textContent = broadcast.title;
        if (msgEl && broadcast.message) msgEl.textContent = broadcast.message;

        if (btnAction) {
          if (broadcast.buttonText && broadcast.buttonUrl) {
            btnAction.textContent = broadcast.buttonText;
            btnAction.style.display = 'inline-block';
            btnAction.onclick = () => {
              window.api.openExternalUrl(broadcast.buttonUrl);
            };
          } else {
            btnAction.style.display = 'none';
          }
        }

        if (btnClose) {
          btnClose.onclick = () => {
            sessionStorage.setItem('dismissed_broadcast_id', broadcast.id);
            if (modalBcast) modalBcast.style.display = 'none';
          };
        }

        if (modalBcast) modalBcast.style.display = 'flex';
      }
    }
  } catch (err) {
    console.warn('Update/broadcast check error:', err);
  }
}

// Start Application
async function initApp() {
  currentSettings = await window.api.getSettings();

  // Populate Nickname
  updateNicknameUI(currentSettings.nickname || 'Player');

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

  // Check Remote Launcher Updates & Broadcast Messages
  await checkLauncherUpdatesAndBroadcasts();

  // Periodic background check every 30 minutes while launcher is running
  setInterval(() => {
    checkLauncherUpdatesAndBroadcasts();
  }, 30 * 60 * 1000);

  // Re-check when window regains focus (with 5-minute debounce)
  let lastFocusCheckTime = Date.now();
  window.addEventListener('focus', () => {
    if (Date.now() - lastFocusCheckTime > 5 * 60 * 1000) {
      lastFocusCheckTime = Date.now();
      checkLauncherUpdatesAndBroadcasts();
    }
  });
}

initApp();
