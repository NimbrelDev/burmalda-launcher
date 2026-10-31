# Burmalda Launcher

Быстрый модульный лаунчер для [Horizon](https://github.com/horizon-rust/horizon) — движка, реализующего Minecraft-геймплей на чистом Rust + Vulkan.

> **Дисклеймер:** это не официальный продукт Minecraft и он никак не связан с Mojang Studios или Microsoft.

## Платформы

| Платформа | Форматы | Статус |
|---|---|---|
| Windows | NSIS-установщик + portable | готово |
| Linux | AppImage, deb, rpm, pacman | готово |
| Android | APK | готово |
| macOS | dmg | в планах |

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

## Архитектура

- **ПК** — Electron: главный процесс в `desktop/`, UI (тот же веб-код) в `src/` + `src/renderer/`.
- **Android** — тот же веб-код в WebView + Java-мост (`android/`), UI синхронизируется из `src/` при сборке APK.
- **Движок Horizon** — скачивается лаунчером на ПК; на телефоне встроен в APK как нативная `.so`-библиотека.

## Лицензия

[MIT](LICENSE)
