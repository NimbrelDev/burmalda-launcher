// --- GLOBAL SKIN & WARDROBE UPDATER ---
function updateSkinUI(dataUrl, skinName = 'Стив') {
  const activeUrl = dataUrl || 'assets/default_skins/steve.png';

  initSkinViewer(activeUrl);

  const img = new Image();
  img.onload = () => {
    if (dockAvatar) drawAvatarHead(dockAvatar, img);
    if (wardrobeAvatarCanvas) drawAvatarHead(wardrobeAvatarCanvas, img);
  };
  img.src = activeUrl;

  if (wardrobeSkinName) wardrobeSkinName.textContent = `Скин: ${skinName}`;
}

function drawAvatarHead(canvas, img) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Base head layer (8x8 at 8,8 on Minecraft skin)
  ctx.drawImage(img, 8, 8, 8, 8, 0, 0, canvas.width, canvas.height);

  // Helmet / Hat overlay (8x8 at 40,8 on Minecraft skin)
  try {
    ctx.drawImage(img, 40, 8, 8, 8, 0, 0, canvas.width, canvas.height);
  } catch (_) {}
}

function updateNicknameUI(nick) {
  const clean = nick || 'Player';
  if (stagePlayerNick && !isEditingNametag) stagePlayerNick.textContent = clean;
  if (dockPlayerName) dockPlayerName.textContent = clean;
  if (inputProfileNickname) inputProfileNickname.value = clean;
}

// Save Profile Nickname
btnSaveProfile?.addEventListener('click', async () => {
  const nick = inputProfileNickname?.value.trim() || 'Player';
  currentSettings.nickname = nick;
  updateNicknameUI(nick);
  await window.api.saveSettings(currentSettings);
});

inputProfileNickname?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const nick = inputProfileNickname.value.trim() || 'Player';
    currentSettings.nickname = nick;
    updateNicknameUI(nick);
    await window.api.saveSettings(currentSettings);
  }
});

