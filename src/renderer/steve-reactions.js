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
