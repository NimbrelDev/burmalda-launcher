// Last skin URL handed to initSkinViewer: needed to rebuild the viewer
// after a WebGL context loss (see recreateSkinViewer below)
let skinViewerSrc = '';

function initSkinViewer(skinSrc) {
  if (!skinViewerCanvas) return;
  const resolved = skinSrc || skinViewerSrc || 'assets/default_skins/steve.png';
  skinViewerSrc = resolved;

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

      // Height fit: the player model always occupies the same fraction of the
      // viewport height and fits entirely (never cropped), on any screen /
      // phone aspect ratio. The perspective camera's vertical frustum is
      // fraction-of-height exact, so one distance formula covers every device.
      const STEVE_FIT_FRACTION = 0.56;  // part of the screen height taken by the model
      const STEVE_HALF_HEIGHT = 16.5;   // model half-height in world units (32 body + small margin)
      const VIEW_SHIFT_UNITS = 1.5;     // raises the model slightly: room for the nametag above and the buttons below

      function applyHeightFit() {
        if (!skinViewer) return;
        const w = window.innerWidth || 1040;
        const h = window.innerHeight || 700;
        if (w <= 0 || h <= 0) return;
        skinViewer.setSize(w, h);
        if (skinViewer.playerWrapper) {
          skinViewer.playerWrapper.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
        } else if (skinViewer.playerObject) {
          skinViewer.playerObject.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
        }
        // On short screens (landscape phone) shrink the model so that Steve's
        // feet stay above the button bar + bottom dock (130 CSS px reserve).
        let fraction = STEVE_FIT_FRACTION;
        const maxFraction = (0.5 - 130 / h) / (14.5 / 33);
        if (maxFraction > 0.25) fraction = Math.min(fraction, maxFraction);
        const fovRad = (skinViewer.fov || 50) * Math.PI / 180;
        const dist = STEVE_HALF_HEIGHT / (Math.tan(fovRad / 2) * fraction);
        const cy = -0.5 - VIEW_SHIFT_UNITS;
        skinViewer.camera.position.set(0, cy, dist);
        skinViewer.camera.position.x = 0;
        skinViewer.camera.position.y = cy;
        skinViewer.camera.lookAt(0, cy, 0);
        if (skinViewer.controls) skinViewer.controls.target.set(0, cy, 0);
      }

      if (skinViewer.playerWrapper) {
        skinViewer.playerWrapper.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
      } else if (skinViewer.playerObject) {
        skinViewer.playerObject.scale.set(baseSteveScale, baseSteveScale, baseSteveScale);
      }

      skinViewer.zoom = 1; // no internal camera-distance adjustment; we fit manually
      skinViewer.fov = 50;
      applyHeightFit();
      skinViewer.controls.enableRotate = false; // We handle dragging and physics directly!
      skinViewer.controls.enableZoom = false;
      skinViewer.controls.enablePan = false;

      // DO NOT set skinViewer.animation to avoid internal loop fighting!
      skinViewer.animation = null;

      // Watch WebGL context loss on this canvas (backgrounding the app on
      // Android kills the context and it never comes back by itself)
      skinViewerCanvas.addEventListener('webglcontextlost', () => {
        window.__skinViewerContextLost = true;
      }, false);
      skinViewerCanvas.addEventListener('webglcontextrestored', () => {
        window.__skinViewerContextLost = false;
      }, false);

      setupSteveInteractiveControls();
      spawnCratesPyramid(skinViewer);
      spawnSteve3DShadow(skinViewer);
      updateSteveUIPositions();

      // Responsive canvas resizing: the model is refitted to the new height
      window.addEventListener('resize', applyHeightFit);
      const resizeObserver = new ResizeObserver(applyHeightFit);
      resizeObserver.observe(document.body);
    } else if (skinViewer) {
      skinViewer.loadSkin(resolved);
      if (skinViewer.playerWrapper) skinViewer.playerWrapper.scale.set(1.0, 1.0, 1.0);
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
      // fixed: projection coordinates are viewport coordinates (the parent
      // .hero-stage may be offset by the header bar on desktop)
      nametag.style.position = 'fixed';
      nametag.style.left = `${nameX}px`;
      nametag.style.top = `${nameY}px`;
    }

    // 2. Position action buttons comfortably below Steve's feet
    if (stageIconBar) {
      const feet = new Vector3();
      feet.set(skinViewer.playerObject.position.x, skinViewer.playerObject.position.y - feetOffsetY, 0);
      feet.project(skinViewer.camera);
      const feetX = Math.round((feet.x * 0.5 + 0.5) * w);
      const feetY = Math.round((-feet.y * 0.5 + 0.5) * h);
      stageIconBar.style.position = 'fixed';
      stageIconBar.style.left = `${feetX}px`;
      stageIconBar.style.top = `${Math.min(feetY + 12, h - 125)}px`;
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

// ============================================================
// Backgrounding / WebGL context loss recovery.
// On Android WebView, switching the app to background destroys the WebGL
// context of the canvas; skinview3d's own restore path does not bring it
// back (screen stays black). Recovery: dispose the viewer, replace the
// canvas element (fresh canvas => fresh context) and re-init everything
// with the same skin. The interaction listeners and the shared frame loop
// are viewer-independent (they read the global skinViewer), so they keep
// working untouched.
// ============================================================
function disposeSkinViewer() {
  if (!skinViewer) return;
  try { skinViewer.dispose(); } catch (_) {} // cancels rAF loop, disposes controls+renderer
  skinViewer = null;
}

function recreateSkinViewer() {
  if (!window.skinview3d) return;
  if (isShotgunActive) return; // never mid-easter-egg; retried below
  disposeSkinViewer();
  const old = skinViewerCanvas;
  if (old && old.parentNode) {
    const fresh = document.createElement('canvas');
    fresh.id = 'skin-viewer-3d';
    fresh.setAttribute('style', old.getAttribute('style') || '');
    old.parentNode.replaceChild(fresh, old);
    skinViewerCanvas = fresh;
  }
  window.__skinViewerContextLost = false;
  initSkinViewer(skinViewerSrc);
  // immediately paint one frame so the stage is never black
  try { if (skinViewer) skinViewer.render(); } catch (_) {}
}

function handleContextLossRecovery(attempt = 0) {
  if (isShotgunActive) {
    // the shotgun easter egg self-resets after ~8s; try again afterwards
    if (attempt < 10) setTimeout(() => handleContextLossRecovery(attempt + 1), 1500);
    return;
  }
  let gl = null;
  try {
    gl = skinViewerCanvas && skinViewerCanvas.getContext('webgl2')
      || skinViewerCanvas && skinViewerCanvas.getContext('webgl');
  } catch (_) {}
  if (!skinViewer || (gl && gl.isContextLost()) || window.__skinViewerContextLost) {
    recreateSkinViewer();
  } else if (skinViewer) {
    // context survived: just nudge one frame to repaint after the pause
    try { skinViewer.render(); } catch (_) {}
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  // give the WebView compositor a moment, then check twice (late restore)
  setTimeout(() => handleContextLossRecovery(), 300);
  setTimeout(() => handleContextLossRecovery(), 1500);
});
