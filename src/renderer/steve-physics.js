// --- STEVE 3D PHYSICAL RAGDOLL & SPRING SIMULATION ---
// Soft, slow springs: reactions swing widely but lazily and glide back to
// the resting pose smoothly instead of snapping (k = stiffness, d = damping).
const stevePhysics = {
  // Head degrees of freedom
  headPitch: { x: 0, v: 0, k: 0.065, d: 0.88 },
  headYaw:   { x: 0, v: 0, k: 0.065, d: 0.88 },
  headRoll:  { x: 0, v: 0, k: 0.077, d: 0.85 },

  // Torso / Body degrees of freedom
  bodyPitch: { x: 0, v: 0, k: 0.06, d: 0.86 },
  bodyRoll:  { x: 0, v: 0, k: 0.06, d: 0.86 },
  bodyYaw:   { x: 0, v: 0, k: 0.06, d: 0.86 },

  // Left Arm degrees of freedom
  lArmPitch: { x: 0, v: 0, k: 0.044, d: 0.90 },
  lArmRoll:  { x: 0, v: 0, k: 0.044, d: 0.90 },
  lArmYaw:   { x: 0, v: 0, k: 0.044, d: 0.90 },

  // Right Arm degrees of freedom
  rArmPitch: { x: 0, v: 0, k: 0.044, d: 0.90 },
  rArmRoll:  { x: 0, v: 0, k: 0.044, d: 0.90 },
  rArmYaw:   { x: 0, v: 0, k: 0.044, d: 0.90 },

  // Left Leg degrees of freedom
  lLegPitch: { x: 0, v: 0, k: 0.055, d: 0.88 },
  lLegRoll:  { x: 0, v: 0, k: 0.055, d: 0.88 },

  // Right Leg degrees of freedom
  rLegPitch: { x: 0, v: 0, k: 0.055, d: 0.88 },
  rLegRoll:  { x: 0, v: 0, k: 0.055, d: 0.88 },

  // Global root displacement & tilt
  recoilZ:   { x: 0, v: 0, k: 0.05, d: 0.89 },
  recoilY:   { x: 0, v: 0, k: 0.055, d: 0.88 },
  recoilX:   { x: 0, v: 0, k: 0.055, d: 0.88 },
  tiltZ:     { x: 0, v: 0, k: 0.05, d: 0.88 }
};

// Step single degree of freedom with viscous damped harmonic motion.
// norm = frame-rate scale (1.0 at 60 fps, see updateSteveFrame).
function stepSpringDOF(dof, norm) {
  const f = norm === undefined ? 1 : norm;
  const force = -dof.k * dof.x - (1 - dof.d) * dof.v;
  dof.v += force * f;
  dof.x += dof.v * f;
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

