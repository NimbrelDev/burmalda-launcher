// --- ANDROID APK EXPORT HANDLER ---
const btnExportApk = document.getElementById('btn-export-apk');

btnExportApk?.addEventListener('click', async () => {
  playUiClickSound();
  if (btnExportApk) {
    btnExportApk.disabled = true;
    btnExportApk.textContent = 'Сборка APK...';
  }
  try {
    const res = await window.api.exportAndroidApk();
    if (res.success) {
      if (btnExportApk) {
        btnExportApk.textContent = 'Готово!';
        setTimeout(() => { if (btnExportApk) { btnExportApk.disabled = false; btnExportApk.textContent = 'Собрать APK'; } }, 3000);
      }
      if (res.adbDevice) {
        showCustomAlert('APK успешно собран!', `Пакет сохранен в ${res.path}\n\nОбнаружено Android устройство (${res.adbDevice}). Нажмите "ОК" для установки.`);
        const installRes = await window.api.installAdbApk();
        if (installRes.success) {
          showCustomAlert('Успешно установлено!', `Игра успешно установлена на устройство ${res.adbDevice} через ADB!`);
        }
      } else {
        showCustomAlert('APK успешно собран!', `Пакет с предустановленным сенсорным управлением сохранен в:\n${res.path}\n\nВы можете скопировать его на телефон или установить через adb install.`);
      }
    } else {
      if (btnExportApk) {
        btnExportApk.disabled = false;
        btnExportApk.textContent = 'Собрать APK';
      }
      showCustomAlert('Ошибка сборки', res.error || 'Не удалось скомпилировать APK');
    }
  } catch (err) {
    if (btnExportApk) {
      btnExportApk.disabled = false;
      btnExportApk.textContent = 'Собрать APK';
    }
    showCustomAlert('Ошибка', err.message);
  }
});

// --- AUDIO & HAPTIC FEEDBACK SYNTHESIZER ---
// audioCtx already declared above
function triggerHapticFeedback() {
  if (settingTouchHaptic && !settingTouchHaptic.checked) return;
  // On Android the bridge already vibrates on touchstart (android-bridge.js);
  // vibrating again on the follow-up click makes one tap feel doubled — skip.
  if (typeof window.__burmaldaHapticAt === 'number' && Date.now() - window.__burmaldaHapticAt < 200) {
    return;
  }
  try {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }
  } catch (_) {}
}

function playUiClickSound() {
  triggerHapticFeedback();
  if (settingTouchSound && !settingTouchSound.checked) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (_) {}
}

