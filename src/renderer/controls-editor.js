// --- FULLSCREEN MOBILE CONTROLS EDITOR & PRESETS SYSTEM ---

(function() {
  const CONTROLS_FILENAME = 'controls.json';
  // controls.json format. v1 (saved by old builds) stored raw screen pixels,
  // which the engine read as GUI units — every layout landed in the wrong
  // place. v2 stores GUI units (the same space the engine HUD uses), so the
  // editor preview and the in-game HUD match.
  const LAYOUT_VERSION = 2;

  // Button metadata & vector icon SVGs
  const BUTTON_DEFS = {
    joystick: {
      id: 'joystick',
      name: 'Джойстик ходьбы',
      isJoystick: true,
      baseSize: 76,
      defaultAnchor: 'bottom_left',
      defaultX: 70,
      defaultY: 70
    },
    jump: {
      id: 'jump',
      name: 'Прыжок',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 52,
      defaultY: 52,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
    },
    sprint: {
      id: 'sprint',
      name: 'Спринт (Бег)',
      baseSize: 44,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 112,
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>'
    },
    attack: {
      id: 'attack',
      name: 'Атака (Катана / ЛКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 52,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 3.5c-3 3-7 8-9.5 12.5l-4 4 1-4c4.5-2.5 9.5-6.5 12.5-9.5z"></path><path d="M5.5 19.5l-2.5 2.5"></path><path d="M12 9l3 3"></path></svg>'
    },
    place: {
      id: 'place',
      name: 'Блок (ПКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 52,
      defaultY: 112,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    },
    inventory: {
      id: 'inventory',
      name: 'Инвентарь (E)',
      baseSize: 44,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 172,
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line><rect x="10" y="8" width="4" height="4" rx="0.5"></rect></svg>'
    },
    f5: {
      id: 'f5',
      name: 'F5 (Вид камеры)',
      baseSize: 32,
      defaultAnchor: 'top_center',
      defaultX: -54,
      defaultY: 20,
      label: 'F5'
    },
    pause: {
      id: 'pause',
      name: 'Пауза (Esc)',
      baseSize: 32,
      defaultAnchor: 'top_center',
      defaultX: -18,
      defaultY: 20,
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
    },
    f3: {
      id: 'f3',
      name: 'F3 (Отладка)',
      baseSize: 32,
      defaultAnchor: 'top_center',
      defaultX: 18,
      defaultY: 20,
      label: 'F3'
    },
    chat: {
      id: 'chat',
      name: 'Чат (T)',
      baseSize: 32,
      defaultAnchor: 'top_center',
      defaultX: 54,
      defaultY: 20,
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="11" r="1"></circle><circle cx="12" cy="11" r="1"></circle><circle cx="16" cy="11" r="1"></circle></svg>'
    },
    keyboard: {
      id: 'keyboard',
      name: 'ПК-Клавиатура',
      baseSize: 32,
      defaultAnchor: 'top_right',
      defaultX: 28,
      defaultY: 24,
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>'
    }
  };

  function createPresetConfig(presetType, removeSprint, hidePcButtons) {
    const is3Fingers = presetType === '3fingers';
    const cfg = { version: LAYOUT_VERSION };

    for (const [key, def] of Object.entries(BUTTON_DEFS)) {
      cfg[key] = {
        anchor: def.defaultAnchor,
        x: def.defaultX,
        y: def.defaultY,
        scale: 1.0,
        visible: true
      };
    }

    // Right-thumb cluster: a 2x2 grid with 60 GUI px between centres, so the
    // 48 px buttons keep a visible gap and their hit areas never overlap.
    // These values are shared with the engine fallback in mobile.rs — keep
    // both in sync.
    if (is3Fingers) {
      // 3-finger claw: attack under the left index finger, the rest under
      // the right thumb.
      cfg.attack.anchor = 'top_left';
      cfg.attack.x = 52;
      cfg.attack.y = 52;
      cfg.attack.scale = 1.2;

      cfg.jump.anchor = 'bottom_right';
      cfg.jump.x = 52;
      cfg.jump.y = 52;

      cfg.place.anchor = 'bottom_right';
      cfg.place.x = 112;
      cfg.place.y = 52;

      cfg.sprint.anchor = 'bottom_right';
      cfg.sprint.x = 52;
      cfg.sprint.y = 112;

      cfg.inventory.anchor = 'bottom_right';
      cfg.inventory.x = 112;
      cfg.inventory.y = 112;
    } else {
      // 2-finger classic: jump in the corner, the rest climb away from it.
      cfg.jump.anchor = 'bottom_right';
      cfg.jump.x = 52;
      cfg.jump.y = 52;

      cfg.attack.anchor = 'bottom_right';
      cfg.attack.x = 112;
      cfg.attack.y = 52;

      cfg.place.anchor = 'bottom_right';
      cfg.place.x = 52;
      cfg.place.y = 112;

      cfg.sprint.anchor = 'bottom_right';
      cfg.sprint.x = 112;
      cfg.sprint.y = 112;

      cfg.inventory.anchor = 'bottom_right';
      cfg.inventory.x = 112;
      cfg.inventory.y = 172;
    }

    if (removeSprint) {
      cfg.sprint.visible = false;
    }

    if (hidePcButtons) {
      cfg.f3.visible = false;
      cfg.f5.visible = false;
      cfg.keyboard.visible = false;
    }

    return cfg;
  }

  let activeLayout = null;
  let originalLayoutJson = '';
  let selectedElementId = null;
  let hasUnsavedChanges = false;

  const canvasEl = document.getElementById('controls-editor-canvas');
  const itemsContainer = document.getElementById('controls-editor-items');
  const btnExit = document.getElementById('btn-controls-exit');
  const btnSave = document.getElementById('btn-controls-save');
  const btnResetPreset = document.getElementById('btn-controls-reset-preset');
  const inspectorEl = document.getElementById('controls-inspector');
  const inspectorTitle = document.getElementById('inspector-element-title');
  const scaleSlider = document.getElementById('inspector-scale-slider');
  const scaleVal = document.getElementById('inspector-scale-val');
  const visibilityBtn = document.getElementById('inspector-visibility-btn');
  const visibilityText = document.getElementById('inspector-visibility-text');

  // Modal elements
  const modalPresets = document.getElementById('modal-controls-presets');
  const tab2Fingers = document.getElementById('preset-tab-2fingers');
  const tab3Fingers = document.getElementById('preset-tab-3fingers');
  const previewScreen = document.getElementById('controls-preview-screen');
  const chkSprintBtn = document.getElementById('preset-chk-sprint-btn');
  const chkPcKeys = document.getElementById('preset-chk-pc-keys');
  const prevSprint = document.getElementById('prev-sprint');
  const prevTopBar = document.getElementById('prev-top-bar');
  const prevKb = document.getElementById('prev-kb');
  const btnPresetApply = document.getElementById('btn-preset-apply');

  let modalSelectedPreset = '2fingers';
  let pendingLaunchTarget = null;

  function markChanges(changed) {
    hasUnsavedChanges = changed;
    if (btnSave) {
      if (changed) {
        btnSave.classList.add('has-changes');
      } else {
        btnSave.classList.remove('has-changes');
      }
    }
  }

  // Get canonical Minecraft GUI coordinates for the screen
  function getGuiVirtualDimensions(containerW, containerH) {
    const dpr = window.devicePixelRatio || 1;
    const physW = (containerW || window.innerWidth) * dpr;
    const physH = (containerH || window.innerHeight) * dpr;
    // Minecraft GUI Scale calculation: min(physW/320, physH/240)
    const guiScale = Math.max(1, Math.min(Math.floor(physW / 320), Math.floor(physH / 240)));
    const sw = physW / guiScale;
    const sh = physH / guiScale;
    return { sw, sh, guiScale, dpr };
  }

  // Convert layout anchor & x/y offsets (in Minecraft GUI space) to current screen pixels
  function computePixelPos(anchor, x, y, width, height) {
    const { sw, sh } = getGuiVirtualDimensions(width, height);
    const scaleX = width / sw;
    const scaleY = height / sh;
    let px = 0;
    let py = 0;
    switch (anchor) {
      case 'bottom_left':
        px = x * scaleX;
        py = height - (y * scaleY);
        break;
      case 'bottom_right':
        px = width - (x * scaleX);
        py = height - (y * scaleY);
        break;
      case 'top_left':
        px = x * scaleX;
        py = y * scaleY;
        break;
      case 'top_right':
        px = width - (x * scaleX);
        py = y * scaleY;
        break;
      case 'top_center':
      default:
        px = width / 2 + (x * scaleX);
        py = y * scaleY;
        break;
    }
    return { px, py };
  }

  // Convert pixel position back to best-fit anchor and GUI offset
  function computeAnchorAndOffset(px, py, width, height) {
    const { sw, sh } = getGuiVirtualDimensions(width, height);
    const scaleX = width / sw;
    const scaleY = height / sh;
    const gx = px / scaleX;
    const gy = py / scaleY;

    const isTop = gy < sh * 0.45;
    const isLeft = gx < sw * 0.35;
    const isRight = gx > sw * 0.65;

    let anchor = 'bottom_left';
    let x = 0;
    let y = 0;

    if (isTop) {
      if (isLeft) {
        anchor = 'top_left';
        x = Math.round(gx);
        y = Math.round(gy);
      } else if (isRight) {
        anchor = 'top_right';
        x = Math.round(sw - gx);
        y = Math.round(gy);
      } else {
        anchor = 'top_center';
        x = Math.round(gx - sw / 2);
        y = Math.round(gy);
      }
    } else {
      if (isRight) {
        anchor = 'bottom_right';
        x = Math.round(sw - gx);
        y = Math.round(sh - gy);
      } else {
        anchor = 'bottom_left';
        x = Math.round(gx);
        y = Math.round(sh - gy);
      }
    }

    return { anchor, x, y };
  }

  function renderEditorItems() {
    if (!itemsContainer || !activeLayout) return;
    itemsContainer.innerHTML = '';
    const rect = canvasEl.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const { sh } = getGuiVirtualDimensions(w, h);
    const scaleY = h / sh;

    for (const [key, itemData] of Object.entries(activeLayout)) {
      const def = BUTTON_DEFS[key];
      if (!def) continue;

      const size = def.baseSize * (itemData.scale || 1.0) * scaleY;
      const { px, py } = computePixelPos(itemData.anchor, itemData.x, itemData.y, w, h);

      const el = document.createElement('div');
      el.className = `controls-drag-item ${def.isJoystick ? 'item-joystick' : ''} ${selectedElementId === key ? 'selected' : ''} ${itemData.visible === false ? 'is-hidden' : ''}`;
      el.id = `drag-item-${key}`;
      el.setAttribute('data-btn-id', key);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${px}px`;
      el.style.top = `${py}px`;

      if (def.isJoystick) {
        el.innerHTML = '<div class="joystick-knob"></div>';
      } else if (def.svg) {
        el.innerHTML = `<span class="controls-item-icon" style="transform: scale(${itemData.scale || 1.0})">${def.svg}</span>`;
      } else if (def.label) {
        el.innerHTML = `<span class="controls-item-label" style="font-size: ${Math.round(10 * (itemData.scale || 1.0))}px">${def.label}</span>`;
      }

      setupDragHandlers(el, key);
      itemsContainer.appendChild(el);
    }

    updateInspectorUI();
  }

  function selectElement(id) {
    selectedElementId = id;
    document.querySelectorAll('.controls-drag-item').forEach(el => {
      if (el.getAttribute('data-btn-id') === id) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
    updateInspectorUI();
  }

  function updateInspectorUI() {
    if (!inspectorEl) return;
    if (!selectedElementId || !activeLayout || !activeLayout[selectedElementId]) {
      inspectorEl.style.visibility = 'hidden';
      return;
    }

    const def = BUTTON_DEFS[selectedElementId];
    const data = activeLayout[selectedElementId];
    inspectorEl.style.visibility = 'visible';
    if (inspectorTitle) inspectorTitle.textContent = def ? def.name : selectedElementId;

    const scaleValNum = data.scale || 1.0;
    if (scaleSlider) scaleSlider.value = Math.round(scaleValNum * 100);
    if (scaleVal) scaleVal.textContent = `${scaleValNum.toFixed(1)}x`;

    const isVis = data.visible !== false;
    if (visibilityBtn) {
      if (isVis) {
        visibilityBtn.classList.remove('hidden-state');
        if (visibilityText) visibilityText.textContent = 'Видима';
      } else {
        visibilityBtn.classList.add('hidden-state');
        if (visibilityText) visibilityText.textContent = 'Скрыта';
      }
    }
  }

  function setupDragHandlers(el, key) {
    let isDragging = false;
    let startPointer = { x: 0, y: 0 };
    let startItemPos = { x: 0, y: 0 };

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      isDragging = true;
      el.classList.add('dragging');
      selectElement(key);

      startPointer = { x: e.clientX, y: e.clientY };
      const curLeft = parseFloat(el.style.left) || 0;
      const curTop = parseFloat(el.style.top) || 0;
      startItemPos = { x: curLeft, y: curTop };
    });

    el.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startPointer.x;
      const dy = e.clientY - startPointer.y;

      const rect = canvasEl.getBoundingClientRect();
      const newX = Math.max(16, Math.min(rect.width - 16, startItemPos.x + dx));
      const newY = Math.max(16, Math.min(rect.height - 16, startItemPos.y + dy));

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    });

    const finishDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}

      const rect = canvasEl.getBoundingClientRect();
      const finalPx = parseFloat(el.style.left) || 0;
      const finalPy = parseFloat(el.style.top) || 0;

      const { anchor, x, y } = computeAnchorAndOffset(finalPx, finalPy, rect.width, rect.height);
      if (activeLayout && activeLayout[key]) {
        activeLayout[key].anchor = anchor;
        activeLayout[key].x = x;
        activeLayout[key].y = y;
        markChanges(true);
      }
    };

    el.addEventListener('pointerup', finishDrag);
    el.addEventListener('pointercancel', finishDrag);
  }

  // Inspector scale & visibility event bindings
  scaleSlider?.addEventListener('input', (e) => {
    if (!selectedElementId || !activeLayout || !activeLayout[selectedElementId]) return;
    const sc = Number(e.target.value) / 100;
    activeLayout[selectedElementId].scale = sc;
    if (scaleVal) scaleVal.textContent = `${sc.toFixed(1)}x`;

    const el = document.getElementById(`drag-item-${selectedElementId}`);
    const def = BUTTON_DEFS[selectedElementId];
    if (el && def) {
      const rect = canvasEl.getBoundingClientRect();
      const { sh } = getGuiVirtualDimensions(rect.width, rect.height);
      const scaleY = rect.height / sh;
      const size = def.baseSize * sc * scaleY;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      const icon = el.querySelector('.controls-item-icon');
      if (icon) icon.style.transform = `scale(${sc})`;
      const lbl = el.querySelector('.controls-item-label');
      if (lbl) lbl.style.fontSize = `${Math.round(10 * sc)}px`;
    }
    markChanges(true);
  });

  visibilityBtn?.addEventListener('click', () => {
    if (!selectedElementId || !activeLayout || !activeLayout[selectedElementId]) return;
    const cur = activeLayout[selectedElementId].visible !== false;
    activeLayout[selectedElementId].visible = !cur;

    const el = document.getElementById(`drag-item-${selectedElementId}`);
    if (el) {
      if (!cur) {
        el.classList.remove('is-hidden');
      } else {
        el.classList.add('is-hidden');
      }
    }
    updateInspectorUI();
    markChanges(true);
  });

  // Topbar actions
  btnExit?.addEventListener('click', () => {
    if (typeof playUiClickSound === 'function') playUiClickSound();
    if (hasUnsavedChanges) {
      if (activeLayout && originalLayoutJson) {
        try { activeLayout = JSON.parse(originalLayoutJson); } catch (_) {}
      }
    }
    markChanges(false);
    if (typeof switchTab === 'function') switchTab('play');
  });

  btnSave?.addEventListener('click', async () => {
    if (typeof playUiClickSound === 'function') playUiClickSound();
    if (!activeLayout) return;

    btnSave.textContent = 'Сохранение...';
    try {
      const json = JSON.stringify(activeLayout, null, 2);
      let ok = false;
      if (window.api && typeof window.api.writeFileText === 'function') {
        ok = await window.api.writeFileText(CONTROLS_FILENAME, json, false);
      }
      if (ok) {
        originalLayoutJson = json;
        markChanges(false);
        btnSave.textContent = 'СОХРАНЕНО!';
        setTimeout(() => { if (btnSave) btnSave.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>СОХРАНИТЬ</span>'; }, 1500);
        if (typeof showToast === 'function') showToast('Раскладка управления успешно сохранена в controls.json');
      } else {
        btnSave.textContent = 'ОШИБКА';
        setTimeout(() => { if (btnSave) btnSave.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>СОХРАНИТЬ</span>'; }, 1500);
      }
    } catch (err) {
      console.error('Failed to save controls.json:', err);
      btnSave.textContent = 'ОШИБКА';
    }
  });

  btnResetPreset?.addEventListener('click', () => {
    if (typeof playUiClickSound === 'function') playUiClickSound();
    openPresetsModal();
  });

  // Presets modal logic & interactive preview
  function updatePreviewScreen() {
    if (!previewScreen) return;
    previewScreen.classList.remove('mode-2fingers', 'mode-3fingers');
    previewScreen.classList.add('mode-' + modalSelectedPreset);

    if (prevSprint) {
      if (chkSprintBtn?.checked) {
        prevSprint.classList.remove('is-preview-hidden');
      } else {
        prevSprint.classList.add('is-preview-hidden');
      }
    }

    const showPc = Boolean(chkPcKeys?.checked);
    if (prevTopBar) {
      if (showPc) prevTopBar.classList.remove('is-preview-hidden');
      else prevTopBar.classList.add('is-preview-hidden');
    }
    if (prevKb) {
      if (showPc) prevKb.classList.remove('is-preview-hidden');
      else prevKb.classList.add('is-preview-hidden');
    }
  }

  function openPresetsModal(onLaunchCallback = null) {
    pendingLaunchTarget = onLaunchCallback;
    if (modalPresets) {
      modalPresets.style.display = 'flex';
      modalPresets.classList.add('open');
      updatePreviewScreen();
    }
  }

  function closePresetsModal() {
    if (modalPresets) {
      modalPresets.style.display = 'none';
      modalPresets.classList.remove('open');
    }
  }

  tab2Fingers?.addEventListener('click', () => {
    modalSelectedPreset = '2fingers';
    tab2Fingers.classList.add('active');
    tab3Fingers?.classList.remove('active');
    updatePreviewScreen();
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  tab3Fingers?.addEventListener('click', () => {
    modalSelectedPreset = '3fingers';
    tab3Fingers.classList.add('active');
    tab2Fingers?.classList.remove('active');
    updatePreviewScreen();
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  chkSprintBtn?.addEventListener('change', () => {
    updatePreviewScreen();
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  chkPcKeys?.addEventListener('change', () => {
    updatePreviewScreen();
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  btnPresetApply?.addEventListener('click', async () => {
    if (typeof playUiClickSound === 'function') playUiClickSound();
    const removeSprint = !Boolean(chkSprintBtn?.checked);
    const hidePc = !Boolean(chkPcKeys?.checked);

    const cfg = createPresetConfig(modalSelectedPreset, removeSprint, hidePc);
    activeLayout = cfg;
    const json = JSON.stringify(cfg, null, 2);

    try {
      if (window.api && typeof window.api.writeFileText === 'function') {
        await window.api.writeFileText(CONTROLS_FILENAME, json, false);
      }
    } catch (err) {
      console.error('Failed writing preset controls.json:', err);
    }

    originalLayoutJson = json;
    markChanges(false);
    closePresetsModal();
    renderEditorItems();
    if (typeof showToast === 'function') {
      showToast(modalSelectedPreset === '3fingers' ? 'Применен пресет: В 3 пальца' : 'Применен пресет: В 2 пальца');
    }

    // If modal was triggered by pressing "В БОЙ", proceed to launch game
    if (typeof pendingLaunchTarget === 'function') {
      const cb = pendingLaunchTarget;
      pendingLaunchTarget = null;
      cb();
    }
  });

  // Load controls.json from disk or fallback
  async function loadControlsLayout() {
    try {
      if (window.api && typeof window.api.readFileText === 'function') {
        const text = await window.api.readFileText(CONTROLS_FILENAME);
        if (text && text.trim().length > 0) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object' && parsed.version === LAYOUT_VERSION) {
            activeLayout = parsed;
            originalLayoutJson = text;
            markChanges(false);
            renderEditorItems();
            return;
          }
          if (parsed && typeof parsed === 'object') {
            // v1 (or older) layouts used raw screen pixels; the engine now
            // reads GUI units, so keeping them would scatter the HUD.
            console.warn('controls.json has an old layout format, resetting to the default preset');
          }
        }
      }
    } catch (err) {
      console.warn('Could not load controls.json, using default preset:', err);
    }

    // Default fallback: 2 fingers
    const defCfg = createPresetConfig('2fingers', false, false);
    activeLayout = defCfg;
    originalLayoutJson = JSON.stringify(defCfg, null, 2);
    markChanges(false);
    renderEditorItems();
  }

  // First-run preset prompt check: called ONLY when user hits "В БОЙ" if no controls.json
  async function checkFirstRunControls(onLaunchCallback = null) {
    try {
      if (window.api && typeof window.api.exists === 'function') {
        const hasFile = await window.api.exists(CONTROLS_FILENAME);
        if (!hasFile) {
          openPresetsModal(onLaunchCallback);
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  window.addEventListener('resize', () => {
    if (activeLayout) renderEditorItems();
  });

  // Load layout on init without showing popup
  window.addEventListener('DOMContentLoaded', async () => {
    await loadControlsLayout();
  });

  // Global interface export
  window.mobileControlsEditor = {
    loadControlsLayout,
    checkFirstRunControls,
    openPresetsModal,
    renderEditorItems
  };

})();
