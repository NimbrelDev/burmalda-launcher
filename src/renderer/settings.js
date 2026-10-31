// --- SETTINGS TAB ---
let saveTimer = null;
function scheduleSaveSettings() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentSettings, 350);
}

async function saveCurrentSettings() {
  const settings = {
    ...currentSettings,
    brandName: 'Burmalda Launcher',
    brandTag: '',
    nickname: inputProfileNickname ? inputProfileNickname.value.trim() || 'Player' : 'Player',
    ramMb: parseInt(settingRamSelect?.value, 10) || 4096,
    preferDiscreteGpu: Boolean(settingGpuToggle?.checked),
    fullscreen: Boolean(settingFullscreenToggle?.checked),
    customArgs: settingCustomArgs?.value.trim() || '',
    savedServers,
  };

  currentSettings = settings;
  await window.api.saveSettings(settings);
}

settingRamSelect?.addEventListener('change', () => scheduleSaveSettings());
settingGpuToggle?.addEventListener('change', () => scheduleSaveSettings());
settingFullscreenToggle?.addEventListener('change', () => scheduleSaveSettings());
settingCustomArgs?.addEventListener('input', () => scheduleSaveSettings());

// Native folder openings
document.querySelectorAll('button[data-open]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const type = btn.getAttribute('data-open');
    if (type) await window.api.openFolder(type);
  });
});

