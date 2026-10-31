// --- MODPACK & ASSEMBLY MANAGER ---
function getModpacks() {
  if (currentSettings.modpacks && Array.isArray(currentSettings.modpacks)) {
    return currentSettings.modpacks;
  }
  return [
    {
      id: 'vanilla',
      name: 'Ванилла Rust',
      version: '26.3',
      isDefault: true,
      description: 'Чистый официальный клиент Horizon 0.2.97 (Rust Client)',
      mods: [],
      texturepacks: [],
      shaders: []
    },
  ];
}

// --- MODPACKS & CUSTOM ASSEMBLIES MANAGER (HORIZON RUST 26.3) ---
let dragSourceIndex = null;
let creationState = {
  activeCat: 'mods',
  name: '',
  mods: [],
  texturepacks: [],
  shaders: []
};

function getActiveModpack() {
  const packs = getModpacks();
  const activeId = currentSettings.activeModpackId || 'vanilla';
  return packs.find((p) => p.id === activeId) || packs[0];
}

function updateDockModpackUI() {
  const pack = getActiveModpack();
  if (dockModpackName) {
    dockModpackName.textContent = pack ? pack.name : 'Ванилла';
  }
}

// Open / Close Modpacks Modal
triggerModpackManager?.addEventListener('click', () => {
  modalModpacks?.classList.add('open');
  showModpackSubView('list');
  renderModpacksList();
});

btnCloseModpacksModal?.addEventListener('click', () => {
  modalModpacks?.classList.remove('open');
});

modalModpacks?.addEventListener('click', (e) => {
  if (e.target === modalModpacks) {
    modalModpacks.classList.remove('open');
  }
});

function showModpackSubView(viewName) {
  if (viewModpackList) viewModpackList.style.display = viewName === 'list' ? 'flex' : 'none';
  if (viewModpackCreate) viewModpackCreate.style.display = viewName === 'create' ? 'block' : 'none';
}

btnBackFromCreate?.addEventListener('click', () => {
  showModpackSubView('list');
  renderModpacksList();
});

document.getElementById('btn-cancel-create-pack')?.addEventListener('click', () => {
  showModpackSubView('list');
  renderModpacksList();
});

// Render assemblies grid (Vanilla + user-created packs + "+" card)
function renderModpacksList() {
  if (!modpackCardsContainer) return;
  modpackCardsContainer.innerHTML = '';

  const packs = getModpacks();
  const activePack = getActiveModpack();

  packs.forEach((pack) => {
    const card = document.createElement('div');
    const isActive = activePack && activePack.id === pack.id;
    card.className = `modpack-card ${isActive ? 'active-pack' : ''}`;

    const modsCount = (pack.mods || []).length;
    const texCount = (pack.texturepacks || []).length;
    const shaCount = (pack.shaders || []).length;

    card.innerHTML = `
      <div class="modpack-card-badge">${pack.isDefault ? 'СТАНДАРТ' : 'ПОЛЬЗОВАТЕЛЬСКАЯ'}</div>
      <div class="modpack-card-title" title="${pack.name}">${pack.name}</div>

      <div class="modpack-card-stats">
        <div class="modpack-card-stat-line">
          <span>Моды:</span>
          <span>${modsCount}</span>
        </div>
        <div class="modpack-card-stat-line">
          <span>Текстурпаки:</span>
          <span>${texCount}</span>
        </div>
        <div class="modpack-card-stat-line">
          <span>Шейдеры:</span>
          <span>${shaCount}</span>
        </div>
      </div>

      <div class="modpack-card-actions">
        <button class="btn-pack-select ${isActive ? 'is-active' : ''}" data-select-pack="${pack.id}">
          ${isActive ? 'АКТИВНА' : 'ВЫБРАТЬ'}
        </button>
        ${
          !pack.isDefault
            ? `<button class="btn-pack-delete" data-delete-pack="${pack.id}" title="Удалить сборку">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
               </button>`
            : ''
        }
      </div>
    `;

    const selectBtn = card.querySelector('button[data-select-pack]');
    if (selectBtn && !isActive) {
      selectBtn.addEventListener('click', async () => {
        currentSettings.activeModpackId = pack.id;
        await window.api.saveSettings(currentSettings);
        updateDockModpackUI();
        renderModpacksList();
        showToast(`Выбрана сборка ${pack.name}`);
      });
    }

    const delBtn = card.querySelector('button[data-delete-pack]');
    if (delBtn) {
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Удалить сборку «${pack.name}»?`)) {
          currentSettings.modpacks = currentSettings.modpacks.filter((p) => p.id !== pack.id);
          if (currentSettings.activeModpackId === pack.id) {
            currentSettings.activeModpackId = 'vanilla';
          }
          await window.api.saveSettings(currentSettings);
          updateDockModpackUI();
          renderModpacksList();
          showToast(`Сборка ${pack.name} удалена`);
        }
      });
    }

    modpackCardsContainer.appendChild(card);
  });

  // EXACT-SIZE "+" RECTANGULAR CARD
  const addCard = document.createElement('div');
  addCard.className = 'modpack-add-card';
  addCard.id = 'btn-card-create-pack';
  addCard.innerHTML = `
    <div class="add-card-icon-box">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
    <div class="add-card-title">Создать сборку</div>
  `;
  addCard.addEventListener('click', () => {
    openCreateModpackWorkbench();
  });
  modpackCardsContainer.appendChild(addCard);
}

// Open Creation Studio Workbench
function openCreateModpackWorkbench() {
  const packs = getModpacks();
  creationState = {
    activeCat: 'mods',
    name: `Сборка ${packs.length + 1}`,
    mods: [],
    texturepacks: [],
    shaders: []
  };

  const inputName = document.getElementById('input-new-pack-name');
  if (inputName) inputName.value = creationState.name;

  const searchInput = document.getElementById('input-addon-search');
  if (searchInput) searchInput.value = '';

  showModpackSubView('create');
  renderCreationWorkbench();
}

// Category tabs click listeners in Creation Studio
document.getElementById('tab-cat-mods')?.addEventListener('click', () => {
  creationState.activeCat = 'mods';
  renderCreationWorkbench();
});
document.getElementById('tab-cat-textures')?.addEventListener('click', () => {
  creationState.activeCat = 'textures';
  renderCreationWorkbench();
});
document.getElementById('tab-cat-shaders')?.addEventListener('click', () => {
  creationState.activeCat = 'shaders';
  renderCreationWorkbench();
});

// Render Creation Studio Workbench UI
