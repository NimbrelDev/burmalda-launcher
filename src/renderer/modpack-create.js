function renderCreationWorkbench() {
  // 1. Highlight Category Tabs
  const tabMods = document.getElementById('tab-cat-mods');
  const tabTex = document.getElementById('tab-cat-textures');
  const tabSha = document.getElementById('tab-cat-shaders');

  tabMods?.classList.toggle('active', creationState.activeCat === 'mods');
  tabTex?.classList.toggle('active', creationState.activeCat === 'textures');
  tabSha?.classList.toggle('active', creationState.activeCat === 'shaders');

  // 2. Render Chosen Addons of the Active Category
  const fileListContainer = document.getElementById('current-cat-file-list');
  const searchInput = document.getElementById('input-addon-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  if (fileListContainer) {
    fileListContainer.innerHTML = '';
    const currentList = creationState[creationState.activeCat] || [];

    if (currentList.length === 0) {
      fileListContainer.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 24px 10px;">
          Список пуст. Нажмите «Выбрать файл с устройства».
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

        const ext = fileKey.includes('.') ? fileKey.split('.').pop() : 'файл';

        row.innerHTML = `
          <span class="file-addon-name" title="${fileKey}">${fileKey}</span>
          <span class="file-addon-tag">.${ext}</span>
          <button class="file-addon-del" title="Убрать" data-del-idx="${realIndex}">Убрать</button>
        `;

        // Remove button listener
        row.querySelector('.file-addon-del').addEventListener('click', (e) => {
          e.stopPropagation();
          creationState[creationState.activeCat].splice(realIndex, 1);
          renderCreationWorkbench();
        });

        fileListContainer.appendChild(row);
      });
    }
  }
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
      showToast(`Файл ${res.filename} добавлен`);
      renderCreationWorkbench();
    } else {
      showToast(`Ошибка: ${res?.error || 'Не удалось прочитать файл'}`);
    }
  }
});

// Save & Select new custom assembly («Готово» in the header bar)
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
