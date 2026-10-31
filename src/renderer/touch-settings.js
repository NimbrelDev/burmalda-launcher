// --- PERSISTENT MOBILE TOUCH CONTROLS CONFIGURATION UI ---
const settingTouchEnable = document.getElementById('setting-touch-enable');
const settingTouchStickMode = document.getElementById('setting-touch-stick-mode');
const settingTouchSneakDouble = document.getElementById('setting-touch-sneak-double');
const settingTouchSprintHold = document.getElementById('setting-touch-sprint-hold');
const settingTouchOpacity = document.getElementById('setting-touch-opacity');
const valTouchOpacity = document.getElementById('val-touch-opacity');
const settingTouchScale = document.getElementById('setting-touch-scale');
const valTouchScale = document.getElementById('val-touch-scale');
const settingTouchSens = document.getElementById('setting-touch-sens');
const valTouchSens = document.getElementById('val-touch-sens');
const settingTouchLefty = document.getElementById('setting-touch-lefty');
const settingTouchSound = document.getElementById('setting-touch-sound');
const settingTouchHaptic = document.getElementById('setting-touch-haptic');
const settingTouchSplit = document.getElementById('setting-touch-split');
const settingTouchMine = document.getElementById('setting-touch-mine');
const valTouchMine = document.getElementById('val-touch-mine');
const btnSaveTouchSettings = document.getElementById('btn-save-touch-settings');

async function loadTouchSettingsUI() {
  try {
    const s = await window.api.getTouchSettings();
    if (settingTouchEnable) settingTouchEnable.checked = s.enabled !== false;
    if (settingTouchStickMode) settingTouchStickMode.value = s.stick_mode || 'floating';
    if (settingTouchSneakDouble) settingTouchSneakDouble.checked = s.sneak_double_tap !== false;
    if (settingTouchSprintHold) settingTouchSprintHold.checked = s.sprint_hold_forward !== false;
    
    if (settingTouchOpacity) {
      const op = Math.round((s.opacity || 0.8) * 100);
      settingTouchOpacity.value = op;
      if (valTouchOpacity) valTouchOpacity.textContent = `${op}%`;
    }
    
    if (settingTouchScale) {
      const sc = Math.round((s.button_scale || 1.0) * 100);
      settingTouchScale.value = sc;
      if (valTouchScale) valTouchScale.textContent = `${(sc / 100).toFixed(1)}x`;
    }

    if (settingTouchSens) {
      const se = Math.round((s.touch_camera_sensitivity || 1.0) * 100);
      settingTouchSens.value = se;
      if (valTouchSens) valTouchSens.textContent = `${(se / 100).toFixed(1)}x`;
    }

    if (settingTouchLefty) settingTouchLefty.checked = Boolean(s.left_handed);
    if (settingTouchSound) settingTouchSound.checked = s.sound_feedback !== false;
    if (settingTouchHaptic) settingTouchHaptic.checked = s.haptic_feedback !== false;
    if (settingTouchSplit) settingTouchSplit.checked = s.split_controls !== false;

    if (settingTouchMine) {
      settingTouchMine.value = s.hold_mine_ms || 350;
      if (valTouchMine) valTouchMine.textContent = `${s.hold_mine_ms || 350} мс`;
    }
  } catch (err) {
    console.error('Failed loading touch settings UI:', err);
  }
}

settingTouchOpacity?.addEventListener('input', (e) => {
  if (valTouchOpacity) valTouchOpacity.textContent = `${e.target.value}%`;
});

settingTouchScale?.addEventListener('input', (e) => {
  if (valTouchScale) valTouchScale.textContent = `${(Number(e.target.value) / 100).toFixed(1)}x`;
});

settingTouchSens?.addEventListener('input', (e) => {
  if (valTouchSens) valTouchSens.textContent = `${(Number(e.target.value) / 100).toFixed(1)}x`;
});

settingTouchMine?.addEventListener('input', (e) => {
  if (valTouchMine) valTouchMine.textContent = `${e.target.value} мс`;
});

// --- TOUCH PRESET SWITCHER ---
document.querySelectorAll('.btn-touch-preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    playUiClickSound();
    const preset = btn.getAttribute('data-preset');
    if (preset === 'bedrock') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'fixed';
      if (settingTouchScale) settingTouchScale.value = 100;
      if (valTouchScale) valTouchScale.textContent = '1.0x';
      if (settingTouchOpacity) settingTouchOpacity.value = 80;
      if (valTouchOpacity) valTouchOpacity.textContent = '80%';
      if (settingTouchSens) settingTouchSens.value = 100;
      if (valTouchSens) valTouchSens.textContent = '1.0x';
      if (settingTouchMine) settingTouchMine.value = 350;
      if (valTouchMine) valTouchMine.textContent = '350 мс';
      if (settingTouchLefty) settingTouchLefty.checked = false;
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Классика Bedrock';
    } else if (preset === 'claw') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'floating';
      if (settingTouchScale) settingTouchScale.value = 115;
      if (valTouchScale) valTouchScale.textContent = '1.2x';
      if (settingTouchOpacity) settingTouchOpacity.value = 65;
      if (valTouchOpacity) valTouchOpacity.textContent = '65%';
      if (settingTouchSens) settingTouchSens.value = 140;
      if (valTouchSens) valTouchSens.textContent = '1.4x';
      if (settingTouchMine) settingTouchMine.value = 250;
      if (valTouchMine) valTouchMine.textContent = '250 мс';
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Клешня (PvP 3-4 пальца)';
    } else if (preset === 'tablet') {
      if (settingTouchStickMode) settingTouchStickMode.value = 'floating';
      if (settingTouchScale) settingTouchScale.value = 135;
      if (valTouchScale) valTouchScale.textContent = '1.4x';
      if (settingTouchOpacity) settingTouchOpacity.value = 85;
      if (valTouchOpacity) valTouchOpacity.textContent = '85%';
      if (settingTouchSens) settingTouchSens.value = 90;
      if (valTouchSens) valTouchSens.textContent = '0.9x';
      if (settingTouchMine) settingTouchMine.value = 350;
      if (valTouchMine) valTouchMine.textContent = '350 мс';
      if (simFeedback) simFeedback.textContent = 'Применен пресет: Планшет / Большой экран';
    }
  });
});

btnSaveTouchSettings?.addEventListener('click', async () => {
  const updated = {
    enabled: Boolean(settingTouchEnable?.checked),
    stick_mode: settingTouchStickMode?.value || 'floating',
    sneak_double_tap: Boolean(settingTouchSneakDouble?.checked),
    sprint_hold_forward: Boolean(settingTouchSprintHold?.checked),
    opacity: Number(settingTouchOpacity?.value || 80) / 100,
    button_scale: Number(settingTouchScale?.value || 100) / 100,
    touch_camera_sensitivity: Number(settingTouchSens?.value || 100) / 100,
    left_handed: Boolean(settingTouchLefty?.checked),
    sound_feedback: Boolean(settingTouchSound?.checked),
    haptic_feedback: Boolean(settingTouchHaptic?.checked),
    split_controls: Boolean(settingTouchSplit?.checked),
    hold_mine_ms: Number(settingTouchMine?.value || 350)
  };

  const ok = await window.api.saveTouchSettings(updated);
  if (ok) {
    btnSaveTouchSettings.textContent = 'Сохранено!';
    setTimeout(() => { if (btnSaveTouchSettings) btnSaveTouchSettings.textContent = 'Сохранить настройки'; }, 2000);
    showCustomAlert('Профиль сохранен', 'Настройки сенсорного управления успешно записаны в .horizon-mod-data/mobile_touch_controls/settings.json!');
  } else {
    showCustomAlert('Ошибка', 'Не удалось сохранить настройки сенсорного управления');
  }
});

