# Burmalda Launcher

Быстрый модульный лаунчер для [Horizon](https://github.com/horizon-rust/horizon) — движка, реализующего Minecraft-геймплей на чистом Rust + Vulkan.

> **Дисклеймер:** это не официальный продукт Minecraft и он никак не связан с Mojang Studios или Microsoft.

## Платформы

| Платформа | Форматы | Статус |
|---|---|---|
| Windows | NSIS-установщик + portable | готово |
| Linux | AppImage, deb, rpm, pacman | готово |
| Android | APK | готово |
| macOS (ARM64) | dmg, zip | готово (unsigned — при первом запуске: правый клик → «Открыть») |

Готовые сборки: [burmalda-hub.ru](https://burmalda-hub.ru)

## Сборка из исходников

```bash
npm install

# Windows (NSIS + portable)
npm run build:win

# Linux (AppImage + deb + rpm + pacman)
npm run build:linux

# Android APK
bash android/package-apk.sh
```

Для сборки Android-APK нужны: `ANDROID_SDK_ROOT`, Android NDK (build-tools 34), а также движок Horizon, скомпилированный под Rust-таргет `aarch64-linux-android` (`.so` кладётся в `android/libs/arm64-v8a/`).

По умолчанию APK подписывается автогенерируемым debug-ключом. Для релизной сборки задайте переменные окружения:

```bash
export ANDROID_KEYSTORE=/путь/к/release.keystore   # вне репозитория
export ANDROID_KEYSTORE_PASS=...
export ANDROID_KEY_ALIAS=...
```

## Правки и сборка с телефона

Всё необходимое уже настроено в GitHub Actions — отдельный компьютер не нужен.

1. **Правка файлов.** Откройте репозиторий в браузере телефона (или в приложении
   GitHub) → нужный файл → карандаш → «Commit changes».
   Если сборка пока не нужна, коммитьте в отдельную ветку: `build-apk` реагирует
   только на push в `master` (и на ручной запуск).
2. **Сборка APK вручную.** Actions → **build-apk** → **Run workflow** → ветка
   `master` → **Run**. Через ~20–30 минут готовый APK появится в артефакте
   `horizon-mobile-apk` на странице запуска.
3. **Релиз всех платформ.** Actions → **release** → **Run workflow** → версия без
   префикса `v` (например `1.0.1`) → `publish=false`, чтобы получить Draft.
4. **Движок Horizon с телефона не редактируется.** CI собирает его из
   `android/patches/horizon-mobile-overlay.patch`; после правок
   `crates/horizon-client/src/mobile.rs` на ПК патч нужно перегенерировать и
   закоммитить (см. `android/patches/README.md`).

Пока проект не готов к сборкам, автозапуск можно временно отключить:
Actions → **build-apk** → **⋯** → **Disable workflow**.

## Архитектура

- **ПК** — Electron: главный процесс в `desktop/`, UI (тот же веб-код) в `src/` + `src/renderer/`.
- **Android** — тот же веб-код в WebView + Java-мост (`android/`), UI синхронизируется из `src/` при сборке APK.
- **Движок Horizon** — скачивается лаунчером на ПК; на телефоне встроен в APK как нативная `.so`-библиотека.

## Лицензия

[MIT](LICENSE)
