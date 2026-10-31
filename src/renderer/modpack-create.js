function renderCreationWorkbench() {
  // 1. Highlight Category Tabs
  const tabMods = document.getElementById('tab-cat-mods');
  const tabTex = document.getElementById('tab-cat-textures');
  const tabSha = document.getElementById('tab-cat-shaders');

  tabMods?.classList.toggle('active', creationState.activeCat === 'mods');
  tabTex?.classList.toggle('active', creationState.activeCat === 'textures');
  tabSha?.classList.toggle('active', creationState.activeCat === 'shaders');

  // 2. Badges count
  const badgeMods = document.getElementById('badge-cat-mods');
  const badgeTex = document.getElementById('badge-cat-textures');
  const badgeSha = document.getElementById('badge-cat-shaders');
  if (badgeMods) badgeMods.textContent = String(creationState.mods.length);
  if (badgeTex) badgeTex.textContent = String(creationState.texturepacks.length);
  if (badgeSha) badgeSha.textContent = String(creationState.shaders.length);

  // 3. Dropzone labels according to active category
  const dragHint = document.getElementById('drag-drop-hint');
  const lblCatFiles = document.getElementById('label-current-cat-files');

  if (creationState.activeCat === 'mods') {
    if (dragHint) dragHint.textContent = 'Формат: .hmod';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ МОДОВ (${creationState.mods.length}):`;
  } else if (creationState.activeCat === 'textures') {
    if (dragHint) dragHint.textContent = 'Формат: .hpack, .zip';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ ТЕКСТУР (${creationState.texturepacks.length}):`;
  } else if (creationState.activeCat === 'shaders') {
    if (dragHint) dragHint.textContent = 'Формат: .hshader, .zip';
    if (lblCatFiles) lblCatFiles.textContent = `ОЧЕРЕДЬ ЗАГРУЗКИ ШЕЙДЕРОВ (${creationState.shaders.length}):`;
  }

  // 4. Render Reorderable List of Files in Current Category
  const fileListContainer = document.getElementById('current-cat-file-list');
  const searchInput = document.getElementById('input-addon-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  if (fileListContainer) {
    fileListContainer.innerHTML = '';
    const currentList = creationState[creationState.activeCat] || [];

    if (currentList.length === 0) {
      fileListContainer.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 24px 10px;">
          Список пуст. Перетащите файлы сюда или нажмите «Выбрать файл с устройства».
        </div>
      `;
    } else {
      currentList.forEach((fileKey, realIndex) => {
        // Apply search filter if query is present
        if (query && !fileKey.toLowerCase().includes(query)) {
          return;
        }

        const row = document.createElement('div');
        row.className = 'file-addon-row';
        row.setAttribute('draggable', 'true');

        const ext = fileKey.includes('.') ? fileKey.split('.').pop() : 'файл';

        row.innerHTML = `
          <div class="drag-handle-btn" title="Потяните для смены очереди">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          </div>
          <span class="file-addon-queue-num">#${realIndex + 1}</span>
          <span class="file-addon-name" title="${fileKey}">${fileKey}</span>
          <span class="file-addon-tag">.${ext}</span>
          <button class="file-addon-del" title="Удалить из очереди" data-del-idx="${realIndex}">Удалить</button>
        `;

        // Reordering Drag and Drop listeners
        row.addEventListener('dragstart', (e) => {
          dragSourceIndex = realIndex;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(realIndex));
          row.classList.add('dragging');
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          row.classList.add('drag-target');
        });

        row.addEventListener('dragleave', () => {
          row.classList.remove('drag-target');
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          row.classList.remove('drag-target');

          // If internal reordering
          if (dragSourceIndex !== null && dragSourceIndex !== realIndex) {
            const list = creationState[creationState.activeCat];
            const [movedItem] = list.splice(dragSourceIndex, 1);
            list.splice(realIndex, 0, movedItem);
            dragSourceIndex = null;
            renderCreationWorkbench();
          }
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          dragSourceIndex = null;
        });

        // Delete button listener
        row.querySelector('.file-addon-del').addEventListener('click', (e) => {
          e.stopPropagation();
          creationState[creationState.activeCat].splice(realIndex, 1);
          renderCreationWorkbench();
        });

        fileListContainer.appendChild(row);
      });
    }
  }

  // 5. Summary in Footer Bar
  const sMods = document.getElementById('summary-mods-badge');
  const sTex = document.getElementById('summary-tex-badge');
  const sSha = document.getElementById('summary-sha-badge');
  if (sMods) sMods.textContent = `${creationState.mods.length} модов`;
  if (sTex) sTex.textContent = `${creationState.texturepacks.length} текстурпаков`;
  if (sSha) sSha.textContent = `${creationState.shaders.length} шейдеров`;
}

// Search input listener (filters the current list in real time)
document.getElementById('input-addon-search')?.addEventListener('input', () => {
  renderCreationWorkbench();
});

// Native file picker button
document.getElementById('btn-pick-custom-file')?.addEventListener('click', async () => {
  let extensions = ['hmod'];
  let title = 'Выберите мод (.hmod)';

  if (creationState.activeCat === 'textures') {
    extensions = ['hpack', 'zip'];
    title = 'Выберите текстурпак (.hpack, .zip)';
  } else if (creationState.activeCat === 'shaders') {
    extensions = ['hshader', 'zip'];
    title = 'Выберите шейдер (.hshader, .zip)';
  }

  const selectedPath = await window.api.selectFile({
    title,
    filters: [{ name: 'Файлы дополнений', extensions }]
  });

  if (selectedPath) {
    const res = await window.api.importModFile(selectedPath);
    if (res && res.success) {
      creationState[creationState.activeCat].push(res.filename);
      showToast(`Файл ${res.filename} добавлен в очередь`);
      renderCreationWorkbench();
    } else {
      showToast(`Ошибка: ${res?.error || 'Не удалось прочитать файл'}`);
    }
  }
});

// Drag and drop handler for adding external files from OS
const dropBox = document.getElementById('modpack-drag-drop');
if (dropBox) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.classList.add('drag-over');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.classList.remove('drag-over');
    });
  });

  dropBox.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropBox.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name || '').split('.').pop().toLowerCase();
      let targetCat = creationState.activeCat;

      if (ext === 'hmod') targetCat = 'mods';
      else if (ext === 'hpack') targetCat = 'textures';
      else if (ext === 'hshader') targetCat = 'shaders';

      const res = await window.api.importModFile(file.path);
      if (res && res.success) {
        creationState[targetCat].push(res.filename);
        showToast(`Файл ${res.filename} добавлен`);
      } else {
        showToast(`Ошибка: ${res?.error || 'Не удалось скопировать'}`);
      }
    }

    renderCreationWorkbench();
  });
}

// Save & Select new custom assembly
document.getElementById('btn-save-new-pack')?.addEventListener('click', async () => {
  const inputName = document.getElementById('input-new-pack-name');
  const name = inputName?.value.trim() || `Сборка ${getModpacks().length + 1}`;
  const newId = `pack-${Date.now()}`;

  const newPack = {
    id: newId,
    name,
    version: '26.3',
    isDefault: false,
    mods: [...creationState.mods],
    texturepacks: [...creationState.texturepacks],
    shaders: [...creationState.shaders]
  };

  if (!currentSettings.modpacks) currentSettings.modpacks = getModpacks();
  currentSettings.modpacks.push(newPack);
  currentSettings.activeModpackId = newId;

  await window.api.saveSettings(currentSettings);
  updateDockModpackUI();
  modalModpacks?.classList.remove('open');
  showToast(`Сборка ${newPack.name} сохранена`);
});

