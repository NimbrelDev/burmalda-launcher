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

