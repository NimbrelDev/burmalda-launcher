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
    await window.api.killGame();
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

  await launchGame(srv);
}

async function launchGame(targetServer = null) {
  if (isRunning) return;
  isRunning = true;
  updateDockForVersion(getCurrentVersionObj());

  const res = await window.api.launchGame(targetServer);
  if (!res.success) {
    isRunning = false;
    alert(`Ошибка запуска Minecraft: ${res.error}`);
    updateDockForVersion(getCurrentVersionObj());
  }
}

window.api.onGameExit((code) => {
  isRunning = false;
  updateDockForVersion(getCurrentVersionObj());
});

