// --- TWO-TIER VERSIONS (MINECRAFT 26.3 & HORIZON 0.2.97 STRICTLY) ---
let selectedMcVersion = '26.3';
let selectedEngineTag = 'v0.2.97';

function getCurrentVersionObj() {
  const activeTag = selectedEngineTag || currentVersionsData?.activeVersion || 'v0.2.97';
  const fallback = { tag: 'v0.2.97', name: 'Horizon 0.2.97', status: 'Релиз', supportedMcVersions: ['26.3'], defaultMcVersion: '26.3', isInstalled: false, isActive: true };
  if (!currentVersionsData || !currentVersionsData.versions) {
    return fallback;
  }
  return currentVersionsData.versions.find((v) => v.tag === activeTag) || currentVersionsData.versions[0] || fallback;
}

window.addEventListener('click', (e) => {
  if (!triggerMcVersion?.contains(e.target) && !menuMcVersions?.contains(e.target)) {
    menuMcVersions?.classList.remove('open');
  }
  if (!triggerEngineVersion?.contains(e.target) && !menuEngineVersions?.contains(e.target)) {
    menuEngineVersions?.classList.remove('open');
  }
});

triggerMcVersion?.addEventListener('click', (e) => {
  e.stopPropagation();
  menuEngineVersions?.classList.remove('open');
  menuMcVersions?.classList.toggle('open');
});

triggerEngineVersion?.addEventListener('click', (e) => {
  e.stopPropagation();
  menuMcVersions?.classList.remove('open');
  menuEngineVersions?.classList.toggle('open');
});

async function refreshVersions() {
  try {
    currentVersionsData = await window.api.getVersions();
  } catch (err) {
    console.error('getVersions error:', err);
  }

  selectedEngineTag = currentVersionsData?.activeVersion || 'v0.2.97';
  const activeVer = getCurrentVersionObj();
  const supported = (activeVer?.supportedMcVersions && activeVer.supportedMcVersions.length > 0)
    ? activeVer.supportedMcVersions
    : ['26.3'];

  // Default to maximum supported Minecraft version if none or unsupported
  if (!selectedMcVersion || !supported.includes(selectedMcVersion)) {
    selectedMcVersion = currentVersionsData?.selectedMcVersion || activeVer?.defaultMcVersion || supported[supported.length - 1] || '26.3';
  }

  renderMcVersionDropdown();
  renderEngineVersionDropdown();
  updateDockForVersion(activeVer);
}

function renderMcVersionDropdown() {
  if (!menuMcVersions) return;
  menuMcVersions.innerHTML = '';

  const activeVer = getCurrentVersionObj();
  const supported = (activeVer?.supportedMcVersions && activeVer.supportedMcVersions.length > 0)
    ? activeVer.supportedMcVersions
    : (currentVersionsData?.minecraftVersions?.map(v => v.id) || ['26.3']);

  if (!supported.includes(selectedMcVersion)) {
    selectedMcVersion = activeVer?.defaultMcVersion || supported[supported.length - 1] || '26.3';
  }

  if (selectedMcVersionLabel) {
    selectedMcVersionLabel.textContent = `Minecraft ${selectedMcVersion}`;
  }

  supported.forEach((mcVer) => {
    const isSelected = mcVer === selectedMcVersion;
    const item = document.createElement('div');
    item.className = `select-item type-stable ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <span style="font-weight:700; font-size:12px; color:#f8fafc;">Minecraft ${escapeHtml(mcVer)}</span>
        <span style="font-size:10px; color:var(--text-muted);">Поддержка Horizon</span>
      </div>
      ${isSelected ? '<span style="font-size:11px; color:#10b981;">✓</span>' : ''}
    `;

    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      menuMcVersions.classList.remove('open');
      selectedMcVersion = mcVer;
      if (selectedMcVersionLabel) {
        selectedMcVersionLabel.textContent = `Minecraft ${selectedMcVersion}`;
      }
      try {
        await window.api.setVersion(selectedEngineTag, selectedMcVersion);
      } catch (_) {}
      renderMcVersionDropdown();
    });

    menuMcVersions.appendChild(item);
  });
}

function renderEngineVersionDropdown() {
  if (!menuEngineVersions) return;
  menuEngineVersions.innerHTML = '';

  const versions = currentVersionsData?.versions || [];
  const activeVer = getCurrentVersionObj();

  if (selectedEngineVersionLabel) {
    selectedEngineVersionLabel.textContent = activeVer?.name || (selectedEngineTag ? `Horizon ${selectedEngineTag}` : 'Horizon 0.2.97');
  }

  versions.forEach((ver) => {
    const isSelected = ver.tag === (selectedEngineTag || activeVer?.tag);
    const isNightly = Boolean(ver.prerelease || ver.channel === 'nightly');
    const badgeText = isNightly ? 'Nightly' : 'Релиз';
    const badgeColor = isNightly ? '#f59e0b' : '#10b981';

    const item = document.createElement('div');
    item.className = `select-item type-${isNightly ? 'nightly' : 'stable'} ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px; min-width:0;">
        <span style="font-size:12px; font-weight:700; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${escapeHtml(ver.name || ver.tag)}
        </span>
        <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(ver.tag)}</span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <span style="font-size:9px; font-weight:800; color:${badgeColor}; background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:4px; letter-spacing:0.5px;">
          ${badgeText}
        </span>
        ${ver.isInstalled ? '<span style="font-size:11px; color:#10b981;" title="Установлена">✓</span>' : ''}
      </div>
    `;

    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      menuEngineVersions.classList.remove('open');
      selectedEngineTag = ver.tag;

      // Update supported Minecraft versions for this Horizon release (defaults to maximum supported version)
      const supported = ver.supportedMcVersions && ver.supportedMcVersions.length > 0 ? ver.supportedMcVersions : ['26.3'];
      selectedMcVersion = ver.defaultMcVersion || supported[supported.length - 1] || '26.3';

      try {
        await window.api.setVersion(selectedEngineTag, selectedMcVersion);
      } catch (_) {}

      renderEngineVersionDropdown();
      renderMcVersionDropdown();
      updateDockForVersion(ver);
    });

    menuEngineVersions.appendChild(item);
  });
}

function updateDockForVersion(ver) {
  const dockVersionBadgeName = document.getElementById('dock-version-badge-name');
  const dockVersionBadgeTag = document.getElementById('dock-version-badge-tag');
  if (dockVersionBadgeName && ver) {
    dockVersionBadgeName.textContent = ver.name || 'Horizon 26.3 Mobile';
  }
  if (dockVersionBadgeTag && ver) {
    dockVersionBadgeTag.textContent = ver.tag || 'v0.2.97';
  }

  if (!btnHeroAction) return;

  btnHeroAction.classList.remove('running-mode', 'download-mode');

  if (isRunning) {
    btnHeroAction.classList.add('running-mode');
    heroBtnText.textContent = 'ЗАКРЫТЬ ИГРУ';
    heroBtnIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor"/>';
    return;
  }

  btnHeroAction.disabled = false;

  if (ver && ver.isInstalled) {
    heroBtnText.textContent = 'ИГРАТЬ';
    heroBtnIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    btnHeroAction.classList.add('download-mode');
    heroBtnText.textContent = 'СКАЧАТЬ';
    heroBtnIcon.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>';
  }
}

// Download execution
async function startVersionDownload(tag) {
  if (isDownloading) return;
  isDownloading = true;

  if (downloadProgressStrip) downloadProgressStrip.style.display = 'block';
  if (downloadStripStatus) downloadStripStatus.textContent = `Загрузка ${tag} с официального сервера...`;
  if (downloadStripPercent) downloadStripPercent.textContent = '0%';
  if (downloadStripFill) downloadStripFill.style.width = '0%';

  if (btnHeroAction) {
    btnHeroAction.disabled = true;
    heroBtnText.textContent = 'ЗАГРУЗКА...';
  }

  const res = await window.api.downloadVersion(tag);
  isDownloading = false;
  if (btnHeroAction) btnHeroAction.disabled = false;

  if (res.success) {
    if (downloadStripStatus) downloadStripStatus.textContent = 'Установка завершена!';
    if (downloadStripPercent) downloadStripPercent.textContent = '100%';
    if (downloadStripFill) downloadStripFill.style.width = '100%';

    setTimeout(() => {
      if (downloadProgressStrip) downloadProgressStrip.style.display = 'none';
    }, 1500);

    await window.api.setVersion(tag, '26.3');
    await refreshVersions();
  } else {
    alert(`Ошибка загрузки версии: ${res.error}`);
    if (downloadProgressStrip) downloadProgressStrip.style.display = 'none';
    await refreshVersions();
  }
}

window.api.onVersionProgress((data) => {
  if (downloadStripStatus) downloadStripStatus.textContent = data.status || 'Загрузка ресурсов...';
  if (downloadStripPercent) downloadStripPercent.textContent = `${data.percent}%`;
  if (downloadStripFill) downloadStripFill.style.width = `${data.percent}%`;
});

