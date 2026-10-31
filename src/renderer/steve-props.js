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
