# Horizon Client Android Mobile Controls Architecture & Upstream Integration Guide

## 1. Architectural Overview

All Android mobile touch handling, on-screen virtual controls, camera look swipe routing, gesture timing, and HUD rendering are fully isolated in a dedicated module:
- **`crates/horizon-client/src/mobile.rs`** (compiled only when `#[cfg(target_os = "android")]`).

This isolation ensures that upstream desktop/WASM changes to `game.rs` and `lib.rs` can be merged with zero merge friction. The core engine files contain only clean 1-line hooks.

---

## 2. On-Screen Touch Controls (Minimal Pojav / MCPE Style)

To maintain maximum screen visibility and zero clutter, the HUD displays strictly **three** on-screen controls:

1. **Round Movement Joystick (Bottom-Left)**
   - Located at bottom-left corner with generous deadzone and smooth proportional thumbstick tracking.
   - Computes normalized vector `(dx, dy)` and sets movement keys (`KeyCode::KeyW`, `KeyCode::KeyS`, `KeyCode::KeyA`, `KeyCode::KeyD`).
   - Center anchor: `(120.0, sh - 120.0)`, outer radius: `65.0`, knob radius: `28.0`.

2. **Jump Button (Bottom-Right)**
   - Located at bottom-right corner: `(sw - 95.0, sh - 95.0, radius 36.0)`.
   - Triggers `KeyCode::Space` (Jump).

3. **Inventory Button (Top-Right)**
   - Located at top-right corner: `(sw - 50.0, 50.0, radius 28.0)`.
   - Triggers `KeyCode::KeyE` (Inventory / Back).

No extra clutter buttons (no shift, no offhand button, no drop button, no pause button).

---

## 3. In-Game Touch Gestures

- **Smooth Camera Look Swipe (Right Screen Half)**:
  - Any touch starting on the right half of the screen (`x >= sw * 0.45`) outside interactive buttons is treated as a camera turn gesture.
  - Delta movement `(dx, dy)` is passed directly into `self.mouse.on_move(dx * SENSITIVITY, dy * SENSITIVITY)`.
- **Quick Tap (<250ms)**:
  - Triggers block placement / interaction / entity attack (`MouseButton::Right` for interact/place or `MouseButton::Left` for attack depending on target raycast).
- **Continuous Hold (>250ms)**:
  - When holding finger still on the screen in `Screen::Playing`, continuous block breaking / mining is triggered (`MouseButton::Left` pressed and held).
  - Released immediately when touch ends.
- **Hotbar Slot Selection**:
  - Tapping the hotbar strip at the bottom of the screen (`y >= sh - 50.0` and `center - 91.0 <= x <= center + 91.0`) calculates the exact slot index `0..9` and sets `self.hotbar_slot`.
- **Inventory Screen Gestures (1:1 Vanilla Minecraft Mechanics)**:
  - **Quick Tap (<250ms)**: Left Click (LMB). Picks up entire stack if hand is empty; places entire stack or swaps stacks if hand holds an item.
  - **Immediate Drag (<250ms, move >8px)**: Left Click Drag (LMB Drag). Evenly divides and distributes the held stack across all traversed slots.
  - **Hold on Slot (>=250ms)**: Right Click (RMB). Takes exactly half the stack if hand is empty; places exactly 1 item into the slot if hand holds an item.
  - **Hold & Drag**: Right Click Drag (RMB Drag). Deposits exactly 1 item into each traversed slot.
  - **Cursor & Paperdoll Stability**: The cursor is automatically centered `(sw/2, sh/2)` when opening containers so the paperdoll faces forward. The cursor coordinates are maintained at the last touch position during inventory interactions so carried item stacks render under the finger and do not fly off screen or accidentally drop items.

---

## 4. Button Selection Glow / Hover Bug Fix

### Problem:
On touchscreens without a physical mouse, a touch release leaves the virtual cursor position parked at the release coordinate. When a button click navigates to a new menu screen (e.g. Pause Menu -> Options), whichever button happens to be under that coordinate receives a persistent hover/glow highlight, confusing the user into thinking it is active or selected.

### Solution:
1. In `mobile.rs`, upon `TouchPhase::Ended` or `TouchPhase::Cancelled`, `self.cursor` is parked off-screen at `(-1000.0, -1000.0)`.
2. When screen transitions occur, cursor coordinates are reset to `(-1000.0, -1000.0)`.
3. If a physical USB/Bluetooth mouse or trackpad is connected, normal `WindowEvent::CursorMoved` events immediately restore and update `self.cursor`, ensuring 100% full mouse hover support is retained.

---

## 5. Exact Hook Locations in Engine Files

Only two files in `crates/horizon-client/` hook into `mobile.rs`:

### A. `crates/horizon-client/src/lib.rs`
Around line 120:
```rust
#[cfg(target_os = "android")]
pub mod mobile;
```

### B. `crates/horizon-client/src/game.rs`
Minimal engine hooks:

1. **Camera Look Activation** (inside `fn apply_mouse_look`, line ~5524):
```rust
        let pointer = self.captured || self.agent_pointer || cfg!(target_os = "android");
        let grabbed = pointer && self.screen == Screen::Playing && self.player.is_some();
        let active = self.focused || self.agent_pointer || cfg!(target_os = "android");
```
Ensures touch camera movement is applied on Android without requiring desktop mouse pointer capture.

2. **HUD Rendering Hook** (inside `fn draw_hud`, line ~5810):
```rust
        #[cfg(target_os = "android")]
        self.draw_mobile_hud(&mut batch);
```

3. **Touch Event Hook** (inside `fn window_event`, line ~12634):
```rust
                #[cfg(target_os = "android")]
                WindowEvent::Touch(touch) => self.handle_mobile_touch(touch),
```

4. **Frame Tick Hook** (inside `fn tick`, line ~13215):
```rust
                    #[cfg(target_os = "android")]
                    self.tick_mobile();
```

5. **Android Back Button Hook** (inside `fn window_event`, line ~12475):
```rust
        if let WindowEvent::KeyboardInput { event: ref mut key_event, .. } = event {
            let is_back = matches!(key_event.physical_key, PhysicalKey::Code(KeyCode::BrowserBack))
                || matches!(&key_event.logical_key, winit::keyboard::Key::Named(winit::keyboard::NamedKey::GoBack | winit::keyboard::NamedKey::BrowserBack));
            if is_back {
                key_event.physical_key = PhysicalKey::Code(KeyCode::Escape);
                key_event.logical_key = winit::keyboard::Key::Named(winit::keyboard::NamedKey::Escape);
            }
        }
```

6. **Universal Menu Mouse Dispatcher** (`pub(crate) fn dispatch_menu_mouse`, line ~12115):
Provides unified mouse/touch click and release handling across ALL menus, screens, containers, workstations, death screen, command blocks, dialogs, and overlays. Replaces over 200 lines of repetitive match arms in `window_event` with a single reusable call.

---

## 6. Upstream Rebase / Merge Guide

When pulling changes from upstream Horizon:
1. If upstream modifies `crates/horizon-client/src/game.rs`:
   - Keep the four hooks listed above.
   - Ensure visibility of `pub(crate)` helpers in `game.rs` (`Screen`, `Game`, `hotbar_slot`, `is_overlay_open()`, etc.) are preserved so `mobile.rs` can access required game state.
2. `crates/horizon-client/src/mobile.rs` does not exist in upstream, so it will never conflict.
3. Build for Android:
   ```bash
   cargo build --target aarch64-linux-android --release --no-default-features --features audio -p horizon-client
   ```
4. Package APK:
   ```bash
   ./android/package-apk.sh
   ```
