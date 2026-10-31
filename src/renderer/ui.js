// --- FLOATING TOAST NOTIFICATIONS ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-pill';

  const iconSvg = `
    <span class="toast-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </span>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Gentle audio pop feedback
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.1);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch (_) {}

  setTimeout(() => {
    toast.classList.add('toast-leaving');
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

// --- TAB NAVIGATION (EXPANDING ACCORDION PILLS) ---
function switchTab(tabName) {
  if (tabName === 'modpacks') {
    modalModpacks?.classList.add('open');
    showModpackSubView('list');
    renderModpacksList();
    return;
  }

  navBtns.forEach((b) => {
    if (b.getAttribute('data-tab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  tabContents.forEach((c) => c.classList.remove('active'));
  const targetPane = document.getElementById(`pane-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  if (tabName === 'settings') {
    loadTouchSettingsUI();
  }
}

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    if (tabName) switchTab(tabName);
  });
});

btnStageSettings?.addEventListener('click', () => switchTab('settings'));

// In-place Minecraft Nametag Editing with Blinking Underscore Cursor
function startEditingNametag() {
  if (isEditingNametag) return;
  isEditingNametag = true;
  btnOpenNametag?.classList.add('editing');
  if (stagePlayerCursor) stagePlayerCursor.style.display = 'inline-block';

  const currentNick = currentSettings.nickname || 'Player';
  if (stagePlayerInput) {
    stagePlayerInput.value = currentNick;
    stagePlayerInput.focus();
    stagePlayerInput.select();
  }
}

async function finishEditingNametag(commit = true) {
  if (!isEditingNametag) return;
  isEditingNametag = false;
  btnOpenNametag?.classList.remove('editing');
  if (stagePlayerCursor) stagePlayerCursor.style.display = 'none';

  if (commit && stagePlayerInput) {
    const rawVal = stagePlayerInput.value.trim();
    const finalNick = rawVal.length > 0 ? rawVal : (currentSettings.nickname || 'Player');
    currentSettings.nickname = finalNick;
    updateNicknameUI(finalNick);
    try {
      await window.api.saveSettings(currentSettings);
    } catch (_) {}
  } else {
    updateNicknameUI(currentSettings.nickname || 'Player');
  }
}

btnOpenNametag?.addEventListener('click', (e) => {
  e.stopPropagation();
  startEditingNametag();
});

stagePlayerInput?.addEventListener('input', () => {
  const val = stagePlayerInput.value;
  if (stagePlayerNick) stagePlayerNick.textContent = val.length > 0 ? val : ' ';
});

stagePlayerInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    finishEditingNametag(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    finishEditingNametag(false);
  }
});

stagePlayerInput?.addEventListener('blur', () => {
  finishEditingNametag(true);
});

window.addEventListener('mousedown', (e) => {
  if (isEditingNametag && !btnOpenNametag?.contains(e.target)) {
    finishEditingNametag(true);
  }
});

dockPlayerCard?.addEventListener('click', () => {
  showToast('Гардероб еще в разработке');
});

