// --- WARDROBE TAB ---
async function refreshWardrobeUI() {
  defaultSkinsList = await window.api.getDefaultSkins();
  renderDefaultSkinsGrid();

  wardrobeList = await window.api.getWardrobe();
  renderCustomWardrobeStrip();
}

function renderDefaultSkinsGrid() {
  if (!mojangDefaultSkinsGrid) return;
  mojangDefaultSkinsGrid.innerHTML = '';

  const activeSkinName = currentSettings.skinName || 'Стив';

  defaultSkinsList.forEach((skin) => {
    const card = document.createElement('div');
    card.className = 'skin-thumbnail-card';
    if (skin.name === activeSkinName) card.classList.add('selected');

    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 44;
    canvas.className = 'skin-thumb-canvas';

    const img = new Image();
    img.onload = () => drawAvatarHead(canvas, img);
    img.src = skin.dataUrl;

    const label = document.createElement('span');
    label.className = 'skin-thumb-name';
    label.textContent = skin.name;

    card.appendChild(canvas);
    card.appendChild(label);

    card.addEventListener('click', async () => {
      const res = await window.api.selectDefaultSkin(skin.id);
      if (res.success) {
        currentSettings.skinPath = res.skinPath;
        currentSettings.skinDataUrl = res.skinDataUrl;
        currentSettings.skinName = res.skinName;
        updateSkinUI(res.skinDataUrl, res.skinName);
        renderDefaultSkinsGrid();
        renderCustomWardrobeStrip();
      }
    });

    mojangDefaultSkinsGrid.appendChild(card);
  });
}

function renderCustomWardrobeStrip() {
  if (!customWardrobeStrip) return;
  customWardrobeStrip.innerHTML = '';

  if (wardrobeList.length === 0) {
    customWardrobeStrip.innerHTML = `
      <div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">
        В коллекции пока нет своих скинов. Нажмите «+ Загрузить свой .png» слева или скачайте по нику.
      </div>
    `;
    return;
  }

  const activeSkinPath = currentSettings.skinPath;

  wardrobeList.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'skin-thumbnail-card';
    card.style.minWidth = '80px';
    if (item.path === activeSkinPath) card.classList.add('selected');

    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 44;
    canvas.className = 'skin-thumb-canvas';

    const img = new Image();
    img.onload = () => drawAvatarHead(canvas, img);
    img.src = item.dataUrl;

    const label = document.createElement('span');
    label.className = 'skin-thumb-name';
    label.textContent = item.name;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Удалить';
    delBtn.style.cssText = 'background:transparent; border:none; color:var(--text-muted); font-size:10px; cursor:pointer; margin-top:2px;';
    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const res = await window.api.deleteFromWardrobe(item.id);
      if (res.success) {
        wardrobeList = res.wardrobe;
        renderCustomWardrobeStrip();
      }
    });

    card.appendChild(canvas);
    card.appendChild(label);
    card.appendChild(delBtn);

    card.addEventListener('click', async () => {
      const res = await window.api.setActiveWardrobeSkin(item.id);
      if (res.success) {
        currentSettings.skinPath = item.path;
        currentSettings.skinDataUrl = item.dataUrl;
        currentSettings.skinName = item.name;
        updateSkinUI(item.dataUrl, item.name);
        renderDefaultSkinsGrid();
        renderCustomWardrobeStrip();
      }
    });

    customWardrobeStrip.appendChild(card);
  });
}

btnUploadNewSkin?.addEventListener('click', async () => {
  const res = await window.api.addToWardrobe();
  if (res.success && res.skin) {
    wardrobeList = res.wardrobe;
    currentSettings.skinPath = res.skin.path;
    currentSettings.skinDataUrl = res.skin.dataUrl;
    currentSettings.skinName = res.skin.name;
    updateSkinUI(res.skin.dataUrl, res.skin.name);
    renderDefaultSkinsGrid();
    renderCustomWardrobeStrip();
  }
});

btnFetchSkinByNick?.addEventListener('click', async () => {
  const nick = inputFetchSkinNick?.value.trim();
  if (!nick) return;

  btnFetchSkinByNick.disabled = true;
  btnFetchSkinByNick.textContent = 'Поиск...';

  const res = await window.api.fetchSkinByName(nick);
  btnFetchSkinByNick.disabled = false;
  btnFetchSkinByNick.textContent = 'Скачать';

  if (res.success && res.skin) {
    wardrobeList = res.wardrobe;
    currentSettings.skinPath = res.skin.path;
    currentSettings.skinDataUrl = res.skin.dataUrl;
    currentSettings.skinName = res.skin.name;
    updateSkinUI(res.skin.dataUrl, res.skin.name);
    renderDefaultSkinsGrid();
    renderCustomWardrobeStrip();
    if (inputFetchSkinNick) inputFetchSkinNick.value = '';
  } else {
    alert(res.error || 'Скин для этого ника не найден на серверах Ely.by и Mojang.');
  }
});

