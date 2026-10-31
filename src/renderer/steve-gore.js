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
