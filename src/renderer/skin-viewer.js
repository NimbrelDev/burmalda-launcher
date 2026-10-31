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
