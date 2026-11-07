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
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 15 12 8 19 15"></polyline></svg>'
    },
    sprint: {
      id: 'sprint',
      name: 'Спринт (Бег)',
      baseSize: 44,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 112,
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 6 12 12 6 18"></polyline><polyline points="12 6 18 12 12 18"></polyline></svg>'
    },
    attack: {
      id: 'attack',
      name: 'Атака (Катана / ЛКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 52,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.8 4.2a1.2 1.2 0 0 0-1.7 0L10.3 12l-1.4-1.4a1 1 0 0 0-1.4 1.4l1.4 1.4-4.8 4.8a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l4.8-4.8 1.4 1.4a1 1 0 0 0 1.4-1.4l-1.4-1.4 7.8-7.8a1.2 1.2 0 0 0 0-1.7l-.7-.7z"/></svg>'
    },
    place: {
      id: 'place',
      name: 'Блок (ПКМ)',
      baseSize: 48,
      defaultAnchor: 'bottom_right',
      defaultX: 52,
      defaultY: 112,
      svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="12,3.5 20.5,8 12,12.5 3.5,8" fill="currentColor" fill-opacity="0.95"/><polygon points="3.5,8 12,12.5 12,21 3.5,16.5" fill="currentColor" fill-opacity="0.6"/><polygon points="12,12.5 20.5,8 20.5,16.5 12,21" fill="currentColor" fill-opacity="0.35"/><path d="M12 3.5L20.5 8v8.5L12 21l-8.5-4.5V8L12 3.5z M12 12.5L20.5 8 M12 12.5V21 M12 12.5L3.5 8" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/></svg>'
    },
    inventory: {
      id: 'inventory',
      name: 'Инвентарь (E)',
      baseSize: 44,
      defaultAnchor: 'bottom_right',
      defaultX: 112,
      defaultY: 172,
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"></rect><line x1="3" y1="10.5" x2="21" y2="10.5"></line><rect x="10.5" y="9" width="3" height="3.5" rx="0.5" fill="currentColor"></rect></svg>'
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
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="3.5" height="15" rx="1.5"></rect><rect x="14.5" y="4.5" width="3.5" height="15" rx="1.5"></rect></svg>'
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
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="7.5" y1="8.5" x2="16.5" y2="8.5"></line><line x1="7.5" y1="12" x2="13.5" y2="12"></line></svg>'
    },
    keyboard: {
      id: 'keyboard',
      name: 'ПК-Клавиатура',
      baseSize: 32,
      defaultAnchor: 'top_right',
      defaultX: 28,
      defaultY: 24,
      svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"></rect><line x1="6.5" y1="9" x2="6.51" y2="9" stroke-width="2.5"></line><line x1="10.5" y1="9" x2="10.51" y2="9" stroke-width="2.5"></line><line x1="14.5" y1="9" x2="14.51" y2="9" stroke-width="2.5"></line><line x1="17.5" y1="9" x2="17.51" y2="9" stroke-width="2.5"></line><line x1="8" y1="14" x2="16" y2="14" stroke-width="2"></line></svg>'
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

  let guiScaleLimit = 0;

  // Load Minecraft options.txt (guiScale setting)
  async function loadGameOptions() {
    try {
      if (window.api && typeof window.api.readFileText === 'function') {
        const text = await window.api.readFileText('options.txt');
        if (text) {
          const match = text.match(/guiScale:(\d+)/);
          if (match) {
            guiScaleLimit = parseInt(match[1], 10) || 0;
            return guiScaleLimit;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load options.txt, defaulting to guiScale: 0 (Auto):', err);
    }
    guiScaleLimit = 0;
    return 0;
  }

  // Get canonical Minecraft GUI coordinates for the screen matching HudBatch::new
  function getGuiVirtualDimensions(containerW, containerH, limit = guiScaleLimit) {
    const dpr = window.devicePixelRatio || 1;
    const physW = (containerW || window.innerWidth) * dpr;
    const physH = (containerH || window.innerHeight) * dpr;
    let scale = 1;
    while ((limit === 0 || scale < limit)
           && Math.floor(physW / (scale + 1)) >= 320
           && Math.floor(physH / (scale + 1)) >= 240) {
      scale += 1;
    }
    const sw = Math.ceil(physW / scale);
    const sh = Math.ceil(physH / scale);
    const cssScale = scale / dpr; // количество CSS-пикселей в 1 GUI-единице
    return { sw, sh, guiScale: scale, dpr, cssScale, physW, physH };
  }

  // Convert layout anchor & x/y offsets (in Minecraft GUI space) to current screen pixels
  function computePixelPos(anchor, x, y, width, height) {
    const { cssScale } = getGuiVirtualDimensions(width, height);
    let px = 0;
    let py = 0;
    switch (anchor) {
      case 'bottom_left':
        px = x * cssScale;
        py = height - y * cssScale;
        break;
      case 'bottom_right':
        px = width - x * cssScale;
        py = height - y * cssScale;
        break;
      case 'top_left':
        px = x * cssScale;
        py = y * cssScale;
        break;
      case 'top_right':
        px = width - x * cssScale;
        py = y * cssScale;
        break;
      case 'top_center':
      default:
        px = width / 2 + x * cssScale;
        py = y * cssScale;
        break;
    }
    return { px, py };
  }

  // Convert pixel position back to best-fit anchor and GUI offset
  function computeAnchorAndOffset(px, py, width, height) {
    const { cssScale } = getGuiVirtualDimensions(width, height);

    const isTop = py < height * 0.35;
    const isLeft = px < width * 0.35;
    const isRight = px > width * 0.65;

    let anchor = 'bottom_left';
    let x = 0;
    let y = 0;

    if (isTop) {
      if (isLeft) {
        anchor = 'top_left';
        x = Math.round(px / cssScale);
        y = Math.round(py / cssScale);
      } else if (isRight) {
        anchor = 'top_right';
        x = Math.round((width - px) / cssScale);
        y = Math.round(py / cssScale);
      } else {
        anchor = 'top_center';
        x = Math.round((px - width / 2) / cssScale);
        y = Math.round(py / cssScale);
      }
    } else {
      if (isRight) {
        anchor = 'bottom_right';
        x = Math.round((width - px) / cssScale);
        y = Math.round((height - py) / cssScale);
      } else {
        anchor = 'bottom_left';
        x = Math.round(px / cssScale);
        y = Math.round((height - py) / cssScale);
      }
    }

    return { anchor, x, y };
  }

  let cachedLatestScreenshotUrl = null;
  let isFetchingScreenshot = false;

  async function checkLatestScreenshot() {
    if (cachedLatestScreenshotUrl || isFetchingScreenshot) return cachedLatestScreenshotUrl;
    isFetchingScreenshot = true;
    try {
      if (window.api && typeof window.api.getScreenshots === 'function') {
        const list = await window.api.getScreenshots();
        if (Array.isArray(list) && list.length > 0) {
          const latest = list[0];
          cachedLatestScreenshotUrl = latest.dataUrl || latest.url || latest.path || null;
        }
      }
    } catch (err) {
      console.warn('Could not fetch screenshots for hud preview:', err);
    } finally {
      isFetchingScreenshot = false;
    }
    return cachedLatestScreenshotUrl;
  }

  async function renderHudPreview(containerW, containerH, passedScale) {
    const hudPreview = document.getElementById('controls-hud-preview');
    if (!hudPreview) return;

    const rect = canvasEl ? canvasEl.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const w = containerW || rect.width || window.innerWidth;
    const h = containerH || rect.height || window.innerHeight;
    const { cssScale: computedScale } = getGuiVirtualDimensions(w, h);
    const cssScale = passedScale || computedScale || 1;

    // 1. Background: latest screenshot if available, otherwise dark atmospheric gradient
    const hudBg = document.getElementById('hud-preview-bg');
    if (hudBg) {
      const screenshot = cachedLatestScreenshotUrl || await checkLatestScreenshot();
      if (screenshot) {
        hudBg.style.backgroundImage = `url("${screenshot}")`;
      }
    }

    // 2. Crosshair: 15x15 GUI px in dead center
    const crosshair = document.getElementById('hud-preview-crosshair');
    if (crosshair) {
      const crossSize = Math.max(12, Math.round(15 * cssScale));
      crosshair.style.width = `${crossSize}px`;
      crosshair.style.height = `${crossSize}px`;
      if (!crosshair.querySelector('svg')) {
        crosshair.innerHTML = `
          <svg viewBox="0 0 15 15" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0h1v7h7v1H8v7H7V8H0V7h7V0z" fill="white" fill-opacity="0.85"/>
          </svg>
        `;
      }
    }

    // 3. Hotbar wrap: 182 GUI px wide, anchored to bottom center
    const hotbarWrap = document.getElementById('hud-preview-hotbar-wrap');
    const wrapW = Math.round(182 * cssScale);
    if (hotbarWrap) {
      hotbarWrap.style.width = `${wrapW}px`;
      hotbarWrap.style.bottom = '0px';
    }

    // 4. Stats: Hearts on left, Hunger on right
    const heartsContainer = document.getElementById('hud-hearts');
    const hungerContainer = document.getElementById('hud-hunger');
    const statIconSize = Math.max(7, Math.round(9 * cssScale));

    if (heartsContainer) {
      if (heartsContainer.children.length !== 10) {
        let heartsHtml = '';
        for (let i = 0; i < 10; i++) {
          heartsHtml += `
            <svg viewBox="0 0 9 9" class="hud-stat-icon" width="${statIconSize}" height="${statIconSize}">
              <path d="M1 2h2v-1h3v1h2v3h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1z" fill="#111111"/>
              <path d="M2 2h1v1h-1zM5 2h1v1h-1zM1 3h7v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z" fill="#e01212"/>
              <rect x="2" y="3" width="1" height="1" fill="#ffffff"/>
            </svg>
          `;
        }
        heartsContainer.innerHTML = heartsHtml;
      } else {
        heartsContainer.querySelectorAll('.hud-stat-icon').forEach(icon => {
          icon.setAttribute('width', statIconSize);
          icon.setAttribute('height', statIconSize);
        });
      }
    }

    if (hungerContainer) {
      if (hungerContainer.children.length !== 10) {
        let hungerHtml = '';
        for (let i = 0; i < 10; i++) {
          hungerHtml += `
            <svg viewBox="0 0 9 9" class="hud-stat-icon" width="${statIconSize}" height="${statIconSize}">
              <path d="M3 1h4v1h1v3h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-3h1z" fill="#111111"/>
              <path d="M3 2h3v1h1v2h-1v1h-1v1h-1v-1h-1v-1h-1v-2h1z" fill="#ba6422"/>
              <rect x="4" y="2" width="2" height="1" fill="#e5893a"/>
              <path d="M6 7h1v1h-1zM7 6h1v1h-1zM7 8h1v1h-1zM8 7h1v1h-1z" fill="#dcd7c5"/>
            </svg>
          `;
        }
        hungerContainer.innerHTML = hungerHtml;
      } else {
        hungerContainer.querySelectorAll('.hud-stat-icon').forEach(icon => {
          icon.setAttribute('width', statIconSize);
          icon.setAttribute('height', statIconSize);
        });
      }
    }

    // 5. XP Bar: 182 GUI px wide x 5 GUI px high
    const xpBar = document.getElementById('hud-xp-bar');
    if (xpBar) {
      const xpH = Math.max(4, Math.round(5 * cssScale));
      xpBar.style.height = `${xpH}px`;
    }

    // 6. Hotbar: 182 GUI px wide x 22 GUI px high, 9 slots of 20 GUI px, 1 active slot frame of 24 GUI px
    const hudHotbar = document.getElementById('hud-hotbar');
    if (hudHotbar) {
      hudHotbar.style.width = `${wrapW}px`;
      const hotbarH = Math.round(22 * cssScale);
      hudHotbar.style.height = `${hotbarH}px`;

      if (hudHotbar.querySelectorAll('.hud-hotbar-slot').length !== 9) {
        hudHotbar.innerHTML = '';
        for (let i = 0; i < 9; i++) {
          const slot = document.createElement('div');
          slot.className = `hud-hotbar-slot ${i === 0 ? 'active' : ''}`;
          slot.setAttribute('data-slot-idx', i);
          hudHotbar.appendChild(slot);
        }
        const activeFrame = document.createElement('div');
        activeFrame.className = 'hud-active-slot-frame';
        hudHotbar.appendChild(activeFrame);
      }

      const slotW = Math.round(20 * cssScale);
      hudHotbar.querySelectorAll('.hud-hotbar-slot').forEach(slot => {
        slot.style.width = `${slotW}px`;
        slot.style.height = `${hotbarH}px`;
      });

      const activeFrame = hudHotbar.querySelector('.hud-active-slot-frame');
      if (activeFrame) {
        const activeSize = Math.round(24 * cssScale);
        activeFrame.style.width = `${activeSize}px`;
        activeFrame.style.height = `${activeSize}px`;
        activeFrame.style.left = `${Math.round(-2 * cssScale)}px`;
        activeFrame.style.top = `${Math.round(-1 * cssScale)}px`;
      }
    }
  }

  function renderEditorItems() {
    if (!itemsContainer || !activeLayout) return;
    itemsContainer.innerHTML = '';
    const rect = canvasEl.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const { cssScale } = getGuiVirtualDimensions(w, h);

    renderHudPreview(w, h, cssScale);

    for (const [key, itemData] of Object.entries(activeLayout)) {
      const def = BUTTON_DEFS[key];
      if (!def) continue;

      const size = def.baseSize * (itemData.scale || 1.0) * cssScale;
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
      const { cssScale } = getGuiVirtualDimensions(rect.width, rect.height);
      const size = def.baseSize * sc * cssScale;
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
    await loadGameOptions();
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
    if (activeLayout) {
      renderEditorItems();
    } else {
      renderHudPreview();
    }
  });

  // Load layout on init without showing popup
  window.addEventListener('DOMContentLoaded', async () => {
    await loadControlsLayout();
  });

  // Global interface export
  window.mobileControlsEditor = {
    loadGameOptions,
    loadControlsLayout,
    checkFirstRunControls,
    openPresetsModal,
    renderEditorItems,
    renderHudPreview,
    getGuiVirtualDimensions
  };

})();
