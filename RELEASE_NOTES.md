# Burmalda Launcher 1.0.0

Первый публичный релиз Burmalda Launcher — модульного лаунчера для движка
[Horizon](https://github.com/horizon-rust/horizon), реализующего Minecraft-геймплей
(версия 26.3) на чистом Rust + Vulkan.

## Платформы

- **Windows** — NSIS-установщик + portable-сборка
- **Linux** — AppImage / deb / rpm / pacman
- **macOS (ARM64)** — dmg / zip, сборка unsigned: при первом запуске — правый клик → «Открыть» (предупреждение Gatekeeper)
- **Android** — APK (`horizon-mobile-1.0.0.apk`)

## Что внутри

- **Автоматическая установка движка.** Horizon скачивается с GitHub, официальные
  ресурсы Minecraft берутся только с серверов Mojang
  (piston-meta.mojang.com / piston-data.mojang.com /
  resources.download.minecraft.net) с проверкой SHA-1 каждого файла по pin'у движка.
- **Авто-подготовка ресурсов** через `horizon-prepare`: лаунчер сам конвертирует
  скачанные ресурсы в формат движка перед первым запуском.
- **Android**: движок Horizon встроен в APK; Minecraft-ассеты скачиваются
  непосредственно на устройство при первом запуске.

## Установка

- **Windows**: `Burmalda Launcher-1.0.0-Setup.exe` (установщик) или
  `Burmalda Launcher-1.0.0.exe` (portable)
- **Linux**: AppImage / deb / rpm / pacman под вашу дистрибуцию
- **macOS (ARM64)**: dmg / zip — unsigned, при первом запуске: правый клик → «Открыть»
- **Android**: `horizon-mobile-1.0.0.apk` (разрешить установку из неизвестных источников)

## Дисклеймер

Burmalda Launcher не является официальным продуктом Minecraft и не одобрен
Mojang Studios или Microsoft.
