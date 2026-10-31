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
