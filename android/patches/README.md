# horizon-mobile-overlay.patch

Патч с мобильным (Android) слоем движка Horizon: весь наш код живёт в
`crates/horizon-client/src/mobile.rs`, а в upstream-файлах остаются только
`pub(crate)`-модификаторы видимости, хуки (`draw_mobile_hud`,
`handle_mobile_touch`, `tick_mobile`), однострочные делегаты и один
однострочный хук пути данных (`android_main` в `lib.rs`).

## Где лежат данные игры

`/sdcard/Horizon` — обычная видимая папка на общей памяти. Она не принадлежит
приложению, поэтому переживает и обновление APK, и полное удаление. Для записи
по обычному пути на Android 11+ лаунчер запрашивает «Доступ ко всем файлам»
(MANAGE_EXTERNAL_STORAGE): сначала свой диалог, затем системный экран
«Разрешить управление всеми файлами».

Пока разрешение не выдано, всё пишется в запасную app-specific папку
`/sdcard/Android/media/<pkg>/files` (она работает без разрешений, но Android
удаляет её вместе с приложением; при первом запуске после выдачи разрешения
данные автоматически переезжают в `/sdcard/Horizon`).

Путь задан в четырёх местах, менять синхронно:
`lib.rs` (`android_main` → `mobile::android_home()`),
`mobile.rs` (`android_home`, `resources_dir`, кандидаты `controls.json`)
и в лаунчере (`publicBase`/`mediaBase`/`externalBase` в
`LauncherActivity.java`); сам выбор папки делает `android_home()` в движке
и `externalBase()` в Java — по проверке записи.

## Базовый коммит

Патч сделан от базового коммита **`7c83966`** (полный sha
`7c839665283157c1ada904d2a10867e52e3443b3`) — это исходники
**Horizon 26.3** («Initial commit of Horizon 26.3 Rust client engine source»).
Наш HEAD движка — `50a65eb` (`50a65eb50259c1d09df204678098f6825aba6e1e`,
локальная ветка `master` рабочего клона).

Патч = `git diff 7c83966 HEAD -- crates/` (изменения только внутри `crates/`,
файлы `lib.rs`/`main.rs`/`Cargo.toml` крейта horizon-client входят в него).
В нём: мобильный HUD (джойстик, прыжок, атака, блок, спринт, инвентарь,
F5/пауза/F3/чат/клавиатура), инвентарь 1:1 с Java Edition, системная
клавиатура (IME), раскладка v2 в GUI-единицах, Noble Gray стиль, жизненный
цикл Android (Suspend/Resume).

**Важно:** локальный клон `horizon-main` не является источником правды для CI.
Единственное, что видит GitHub, — этот файл. После любых правок `mobile.rs`
патч надо перегенерировать (см. «При смене pin-коммита») и закоммитить.

## Как применяется

В исходниках движка, распакованных из `horizon-source.tar.gz` **именно
базового коммита** `7c83966`:

```bash
cd horizon-src
git apply --check ../horizon-mobile-overlay.patch   # проверка
git apply ../horizon-mobile-overlay.patch            # применение
# если git apply упал (например, tarball без .git, чуть иное дерево) —
# попробовать классический patch, он терпимее к контексту:
patch -p1 < ../horizon-mobile-overlay.patch
```

`git apply` по умолчанию строг к контексту; `patch -p1` допускает сдвиг
контекста (fuzz), поэтому в CI сначала пробуется `git apply`, при неудаче —
`patch -p1` (см. `.github/workflows/build-apk.yml`).

## Что после патча ожидает workflow (build-apk.yml)

1. `.cargo/config.toml` в корне исходников НЕ входит в патч (в локальном репо
   он с машинными путями к NDK) — workflow генерирует его сам под CI-NDK.
2. Сборка: `cargo build -p horizon-client --target aarch64-linux-android
   --release --no-default-features --features audio,mods`
   (env `CC_aarch64_linux_android` / `AR_aarch64_linux_android` на clang/ar из NDK).
3. Полученную `libhorizon_client.so` workflow кладёт в `android/libs/arm64-v8a/`
   и вызывает `android/package-apk.sh` (упаковка + подпись).

## При смене pin-коммита

Коммит, на который указывает `HORIZON_COMMIT` в `build-apk.yml`, — это базовый
`7c83966`. Если база меняется (ребейз нашего слоя на новую версию upstream):

1. перебазировать наш слой, добиться, чтобы `git diff <новая база> HEAD -- crates/`
   накладывался на новые исходники;
2. перегенерировать патч:
   `git -C <horizon-main> diff <новая база> HEAD -- crates/ > android/patches/horizon-mobile-overlay.patch`;
3. обновить `HORIZON_COMMIT` в `.github/workflows/build-apk.yml` и этот README.

Примечание: пока коммит `7c83966` недоступен в публичном git-репозитории
upstream (там история ушла далеко вперёд, и этого sha там нет), workflow
скачивает исходники по прямому URL `HORIZON_SOURCE_URL` — положите
`horizon-source.tar.gz` именно базового коммита в свой fork/mirror
(например, как asset релиза) и укажите URL в переменной вверху workflow.
