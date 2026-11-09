// --- GAME MODE SELECTION (Singleplayer vs PVP) ---
let selectedGameMode = 'singleplayer';
document.querySelectorAll('.mode-card[data-mode]').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card[data-mode]').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedGameMode = card.getAttribute('data-mode') || 'singleplayer';
  });
});

// Big Action Button Click
btnHeroAction?.addEventListener('click', () => {
  triggerPlayAction(null);
});

async function triggerPlayAction(targetServer = null) {
  const activeTag = 'v0.2.97';
  const ver = getCurrentVersionObj();

  if (isRunning) {
    // Always return the button to "PLAY", even if the :game process died
    // before the 1.5 s exit poll could observe it (a crash right after
    // launch). Otherwise the button would stay in "CLOSE GAME" forever.
    try { await window.api.killGame(); } catch (_) {}
    isRunning = false;
    updateDockForVersion(getCurrentVersionObj());
    return;
  }

  // Pre-flight check: ensure launcher version is not blocked before launching game
  try {
    const updateInfo = await window.api.checkLauncherUpdate();
    if (updateInfo && updateInfo.isBlocked) {
      await checkLauncherUpdatesAndBroadcasts();
      return;
    }
  } catch (_) {}

  if (!ver || !ver.isInstalled) {
    await startVersionDownload(activeTag);
    return;
  }

  let srv = targetServer;
  if (!srv && selectedGameMode === 'pvp') {
    srv = inputPlayServer?.value || '127.0.0.1:25565';
  }

  // Pre-flight check on mobile: prompt user for controls preset if not set
  if (window.api && window.api.isAndroid) {
    try {
      const hasControls = await window.api.exists('controls.json');
      if (!hasControls && window.mobileControlsEditor?.openPresetsModal) {
        window.mobileControlsEditor.openPresetsModal(() => launchGame(srv));
        return;
      }
    } catch (_) {}
  }

  await launchGame(srv);
}

async function launchGame(targetServer = null) {
  if (isRunning) return;
  isRunning = true;
  updateDockForVersion(getCurrentVersionObj());

  let res = { success: false, error: 'Неизвестная ошибка запуска' };
  try {
    res = await window.api.launchGame(targetServer);
  } catch (err) {
    res = { success: false, error: (err && (err.message || err)) || 'Неизвестная ошибка запуска' };
  }
  if (!res || !res.success) {
    isRunning = false;
    alert(`Ошибка запуска Minecraft: ${res && res.error ? res.error : 'неизвестная ошибка'}`);
    updateDockForVersion(getCurrentVersionObj());
  }
}

window.api.onGameExit((code) => {
  isRunning = false;
  updateDockForVersion(getCurrentVersionObj());
});

