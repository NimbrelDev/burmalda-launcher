// Burmalda Launcher — Renderer Entry Point
// Application bootstrap: remote update checks, broadcast announcements and initApp().
// Feature modules are loaded as classic scripts before this file (see index.html).

// Remote Launcher Updates & Broadcast Announcements
async function checkLauncherUpdatesAndBroadcasts() {
  try {
    // 1. Check Launcher Version & Remote Block
    const updateInfo = await window.api.checkLauncherUpdate();
    if (updateInfo) {
      if (updateInfo.isBlocked) {
        // Hard block: user cannot close this modal, play button is disabled
        const modalBlocked = document.getElementById('modal-version-blocked');
        const titleEl = document.getElementById('blocked-modal-title');
        const msgEl = document.getElementById('blocked-modal-message');
        const btnDl = document.getElementById('btn-blocked-download');

        if (titleEl && updateInfo.blockedTitle) titleEl.textContent = updateInfo.blockedTitle;
        if (msgEl && updateInfo.blockedMessage) msgEl.textContent = updateInfo.blockedMessage;

        if (btnDl) {
          btnDl.onclick = () => {
            window.api.openExternalUrl(updateInfo.downloadUrl || 'https://burmalda-hub.ru');
          };
        }

        if (btnHeroAction) {
          btnHeroAction.disabled = true;
          btnHeroAction.style.opacity = '0.5';
          btnHeroAction.style.cursor = 'not-allowed';
        }

        if (modalBlocked) modalBlocked.style.display = 'flex';
        return; // Stop further checks if blocked
      } else if (updateInfo.hasUpdate) {
        // Soft update notification
        const modalUpdate = document.getElementById('modal-version-update');
        const titleEl = document.getElementById('update-modal-title');
        const msgEl = document.getElementById('update-modal-message');
        const btnDl = document.getElementById('btn-update-download');
        const btnDismiss = document.getElementById('btn-update-dismiss');

        if (titleEl && updateInfo.title) titleEl.textContent = updateInfo.title;
        if (msgEl && updateInfo.message) msgEl.textContent = updateInfo.message;

        if (btnDl) {
          btnDl.onclick = () => {
            window.api.openExternalUrl(updateInfo.downloadUrl || 'https://burmalda-hub.ru');
            if (modalUpdate) modalUpdate.style.display = 'none';
          };
        }
        if (btnDismiss) {
          btnDismiss.onclick = () => {
            if (modalUpdate) modalUpdate.style.display = 'none';
          };
        }

        if (modalUpdate) modalUpdate.style.display = 'flex';
      }
    }

    // 2. Check Remote Broadcast Message (Alert to players)
    const broadcast = await window.api.checkBroadcastMessage();
    if (broadcast && broadcast.hasMessage) {
      const lastDismissed = sessionStorage.getItem('dismissed_broadcast_id');
      if (lastDismissed !== broadcast.id) {
        const modalBcast = document.getElementById('modal-broadcast');
        const titleEl = document.getElementById('broadcast-modal-title');
        const msgEl = document.getElementById('broadcast-modal-message');
        const btnClose = document.getElementById('btn-broadcast-close');
        const btnAction = document.getElementById('btn-broadcast-action');

        if (titleEl && broadcast.title) titleEl.textContent = broadcast.title;
        if (msgEl && broadcast.message) msgEl.textContent = broadcast.message;

        if (btnAction) {
          if (broadcast.buttonText && broadcast.buttonUrl) {
            btnAction.textContent = broadcast.buttonText;
            btnAction.style.display = 'inline-block';
            btnAction.onclick = () => {
              window.api.openExternalUrl(broadcast.buttonUrl);
            };
          } else {
            btnAction.style.display = 'none';
          }
        }

        if (btnClose) {
          btnClose.onclick = () => {
            sessionStorage.setItem('dismissed_broadcast_id', broadcast.id);
            if (modalBcast) modalBcast.style.display = 'none';
          };
        }

        if (modalBcast) modalBcast.style.display = 'flex';
      }
    }
  } catch (err) {
    console.warn('Update/broadcast check error:', err);
  }
}

// Start Application
async function initApp() {
  currentSettings = await window.api.getSettings();

  // Populate Nickname
  updateNicknameUI(currentSettings.nickname || 'Player');

  // Populate Settings
  if (settingRamSelect) settingRamSelect.value = String(currentSettings.ramMb || 4096);
  if (settingGpuToggle) settingGpuToggle.checked = currentSettings.preferDiscreteGpu !== false;
  if (settingFullscreenToggle) settingFullscreenToggle.checked = Boolean(currentSettings.fullscreen);
  if (settingCustomArgs) settingCustomArgs.value = currentSettings.customArgs || '';

  // Load Active Skin & Steve 3D Model
  const skinRes = await window.api.getSkin();
  if (skinRes && skinRes.skinDataUrl) {
    updateSkinUI(skinRes.skinDataUrl, skinRes.skinName || 'Стив');
  } else {
    updateSkinUI(null, 'Стив');
  }

  // Load Modpack Dock UI
  updateDockModpackUI();

  // Load Saved Servers & Popular Servers
  await loadSavedServers();

  // Load Versions
  await refreshVersions();

  // Pre-load Wardrobe
  await refreshWardrobeUI();

  // Pre-load Touch Controls
  await loadTouchSettingsUI();

  // Check Remote Launcher Updates & Broadcast Messages
  await checkLauncherUpdatesAndBroadcasts();

  // Periodic background check every 30 minutes while launcher is running
  setInterval(() => {
    checkLauncherUpdatesAndBroadcasts();
  }, 30 * 60 * 1000);

  // Re-check when window regains focus (with 5-minute debounce)
  let lastFocusCheckTime = Date.now();
  window.addEventListener('focus', () => {
    if (Date.now() - lastFocusCheckTime > 5 * 60 * 1000) {
      lastFocusCheckTime = Date.now();
      checkLauncherUpdatesAndBroadcasts();
    }
  });
}

initApp();
