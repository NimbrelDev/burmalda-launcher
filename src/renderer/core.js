// Burmalda Launcher — Core Frontend Controller
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
// Steve Interaction & Physics State
// let (not const): the canvas element is replaced when the WebGL context is
// lost after backgrounding the app (Android WebView never restores it)
let skinViewerCanvas = document.getElementById('skin-viewer-3d');
const btnStageSettings = document.getElementById('btn-stage-settings');
const btnStageFolder = document.getElementById('btn-stage-folder');


// Servers Tab
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
// --- APPLICATION STATE ---
let isRunning = false;
let isDownloading = false;
let currentVersionsData = { versions: [], activeVersion: 'v0.2.97', latestStableTag: 'v0.2.97' };
let currentSettings = {};
let savedServers = [];
let defaultSkinsList = [];
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
