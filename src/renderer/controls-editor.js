// --- FULLSCREEN MOBILE CONTROLS EDITOR & PRESETS SYSTEM ---

(function() {
  const CONTROLS_FILENAME = 'controls.json';

  // Button metadata & vector icon SVGs
  const BUTTON_DEFS = {
    joystick: {
      id: 'joystick',
      name: 'Джойстик ходьбы',
      isJoystick: true,
      baseSize: 90,
      defaultAnchor: 'bottom_left',
      defaultX: 70,
      defaultY: 70
    },
    jump: {
      id: 'jump',
      name: 'Прыжок',
      baseSize: 52,
      defaultAnchor: 'bottom_right',
      defaultX: 50,
      defaultY: 50,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
    },
    sprint: {
      id: 'sprint',
      name: 'Спринт (Бег)',
      baseSize: 44,
      defaultAnchor: 'bottom_right',
      defaultX: 104,
      defaultY: 44,
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>'
    },
    attack: {
      id: 'attack',
      name: 'Удар (ЛКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 104,
      defaultY: 100,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line></svg>'
    },
    place: {
      id: 'place',
      name: 'Блок (ПКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 50,
      defaultY: 100,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    },
    f5: {
      id: 'f5',
      name: 'F5 (Вид камеры)',
      baseSize: 34,
      defaultAnchor: 'top_center',
      defaultX: -54,
      defaultY: 20,
      label: 'F5'
    },
    pause: {
      id: 'pause',
      name: 'Пауза (Esc)',
      baseSize: 34,
      defaultAnchor: 'top_center',
      defaultX: -18,
      defaultY: 20,
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
    },
    f3: {
      id: 'f3',
      name: 'F3 (Отладка)',
      baseSize: 34,
      defaultAnchor: 'top_center',
      defaultX: 18,
      defaultY: 20,
      label: 'F3'
    },
    chat: {
      id: 'chat',
      name: 'Чат (T)',
      baseSize: 34,
      defaultAnchor: 'top_center',
      defaultX: 54,
      defaultY: 20,
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="11" r="1"></circle><circle cx="12" cy="11" r="1"></circle><circle cx="16" cy="11" r="1"></circle></svg>'
    },
    keyboard: {
      id: 'keyboard',
      name: 'ПК-Клавиатура',
      baseSize: 38,
      defaultAnchor: 'top_right',
      defaultX: 28,
      defaultY: 24,
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>'
    }
  };

  function createPresetConfig(presetType, removeSprint, hidePcButtons) {
    const is3Fingers = presetType === '3fingers';
    const cfg = {};

    for (const [key, def] of Object.entries(BUTTON_DEFS)) {
      cfg[key] = {
        anchor: def.defaultAnchor,
        x: def.defaultX,
        y: def.defaultY,
        scale: 1.0,
        visible: true
      };
    }

    if (is3Fingers) {
      // In 3-finger claw preset, attack button is moved to top-left sector under index finger
      cfg.attack.anchor = 'top_left';
      cfg.attack.x = 52;
      cfg.attack.y = 52;
      cfg.attack.scale = 1.15;
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
  const card2Fingers = document.getElementById('preset-card-2fingers');
  const card3Fingers = document.getElementById('preset-card-3fingers');
  const chkSprint = document.getElementById('preset-chk-sprint-stick');
  const chkHidePc = document.getElementById('preset-chk-hide-pc');
  const btnPresetApply = document.getElementById('btn-preset-apply');

  let modalSelectedPreset = '2fingers';

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

  // Convert layout anchor & x/y offsets to current screen pixels
  function computePixelPos(anchor, x, y, width, height) {
    let px = 0;
    let py = 0;
    switch (anchor) {
      case 'bottom_left':
        px = x;
        py = height - y;
        break;
      case 'bottom_right':
        px = width - x;
        py = height - y;
        break;
      case 'top_left':
        px = x;
        py = y;
        break;
      case 'top_right':
        px = width - x;
        py = y;
        break;
      case 'top_center':
      default:
        px = width / 2 + x;
        py = y;
        break;
    }
    return { px, py };
  }

  // Convert pixel position back to best-fit anchor and offset
  function computeAnchorAndOffset(px, py, width, height) {
    const isTop = py < height * 0.45;
    const isLeft = px < width * 0.35;
    const isRight = px > width * 0.65;

    let anchor = 'bottom_left';
    let x = 0;
    let y = 0;

    if (isTop) {
      if (isLeft) {
        anchor = 'top_left';
        x = Math.round(px);
        y = Math.round(py);
      } else if (isRight) {
        anchor = 'top_right';
        x = Math.round(width - px);
        y = Math.round(py);
      } else {
        anchor = 'top_center';
        x = Math.round(px - width / 2);
        y = Math.round(py);
      }
    } else {
      if (isRight) {
        anchor = 'bottom_right';
        x = Math.round(width - px);
        y = Math.round(height - py);
      } else {
        anchor = 'bottom_left';
        x = Math.round(px);
        y = Math.round(height - py);
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

    for (const [key, itemData] of Object.entries(activeLayout)) {
      const def = BUTTON_DEFS[key];
      if (!def) continue;

      const size = def.baseSize * (itemData.scale || 1.0);
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
      const size = def.baseSize * sc;
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

  // Presets modal logic
  function openPresetsModal() {
    if (modalPresets) {
      modalPresets.style.display = 'flex';
      modalPresets.classList.add('open');
    }
  }

  function closePresetsModal() {
    if (modalPresets) {
      modalPresets.style.display = 'none';
      modalPresets.classList.remove('open');
    }
  }

  card2Fingers?.addEventListener('click', () => {
    modalSelectedPreset = '2fingers';
    card2Fingers.classList.add('selected');
    card3Fingers?.classList.remove('selected');
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  card3Fingers?.addEventListener('click', () => {
    modalSelectedPreset = '3fingers';
    card3Fingers.classList.add('selected');
    card2Fingers?.classList.remove('selected');
    if (typeof playUiClickSound === 'function') playUiClickSound();
  });

  btnPresetApply?.addEventListener('click', async () => {
    if (typeof playUiClickSound === 'function') playUiClickSound();
    const removeSprint = Boolean(chkSprint?.checked);
    const hidePc = Boolean(chkHidePc?.checked);

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
      showToast(modalSelectedPreset === '3fingers' ? 'Применен пресет: В 3 пальца (Клешня)' : 'Применен пресет: В 2 пальца (Классика)');
    }
  });

  // Load controls.json from disk or fallback
  async function loadControlsLayout() {
    try {
      if (window.api && typeof window.api.readFileText === 'function') {
        const text = await window.api.readFileText(CONTROLS_FILENAME);
        if (text && text.trim().length > 0) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            activeLayout = parsed;
            originalLayoutJson = text;
            markChanges(false);
            renderEditorItems();
            return;
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

  // First-run preset prompt check: called on init and launch
  async function checkFirstRunControls() {
    try {
      if (window.api && typeof window.api.exists === 'function') {
        const hasFile = await window.api.exists(CONTROLS_FILENAME);
        if (!hasFile) {
          openPresetsModal();
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  window.addEventListener('resize', () => {
    if (activeLayout) renderEditorItems();
  });

  // Hook into launcher lifecycle:
  window.addEventListener('DOMContentLoaded', async () => {
    await loadControlsLayout();
    setTimeout(() => {
      checkFirstRunControls();
    }, 600);
  });

  // Global interface export
  window.mobileControlsEditor = {
    loadControlsLayout,
    checkFirstRunControls,
    openPresetsModal,
    renderEditorItems
  };

})();
