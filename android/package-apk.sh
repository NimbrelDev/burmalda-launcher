#!/usr/bin/env bash
set -euo pipefail

ANDROID_SDK="${ANDROID_SDK_ROOT:-/home/roman/Android/Sdk}"
BUILD_TOOLS="$ANDROID_SDK/build-tools/34.0.0"
PLATFORM="$ANDROID_SDK/platforms/android-34/android.jar"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORK_DIR="$SCRIPT_DIR/build"
OUT_DIR="$PROJECT_ROOT/dist/android"

echo "=== Packaging Horizon Android APK ==="
mkdir -p "$WORK_DIR/compiled_res" "$WORK_DIR/assets/launcher" "$OUT_DIR"

# 1. Sync UI frontend from src/ into Android assets
echo "Syncing frontend UI from $PROJECT_ROOT/src to Android assets..."
rm -rf "$WORK_DIR/assets"
mkdir -p "$WORK_DIR/assets/launcher"
cp -r "$PROJECT_ROOT/src/"* "$WORK_DIR/assets/launcher/"
cp "$SCRIPT_DIR/bridge/android-bridge.js" "$WORK_DIR/assets/launcher/android-bridge.js"

# Inject android-bridge.js before the first renderer module script if not already present.
# renderer.js is the entry point and must stay the LAST script tag (see index.html);
# renderer/*.js scripts call window.api at load time, so the bridge must precede them all.
if ! grep -q "android-bridge.js" "$WORK_DIR/assets/launcher/index.html"; then
    sed -i 's|<script src="renderer/core.js"></script>|<script src="android-bridge.js"></script>\n  <script src="renderer/core.js"></script>|' "$WORK_DIR/assets/launcher/index.html"
fi

# 2. Compile resources
"$BUILD_TOOLS/aapt2" compile --dir "$SCRIPT_DIR/res" -o "$WORK_DIR/compiled_res.zip"

# 3. Link APK
AAPT_LINK_ARGS=(
    -I "$PLATFORM"
    --manifest "$SCRIPT_DIR/AndroidManifest.xml"
    -A "$WORK_DIR/assets"
    -o "$WORK_DIR/unaligned.apk"
)

"$BUILD_TOOLS/aapt2" link "${AAPT_LINK_ARGS[@]}" "$WORK_DIR/compiled_res.zip"

# 4. Compile Launcher Java code & DEX
# NOTE: LauncherActivity.java must not use lambdas or anonymous classes:
# d8 8.2.2 (with javac 21) fails with an NPE dexing them. Keep everything
# as named static nested classes (see the header comment in the .java file).
if [ -d "$SCRIPT_DIR/src" ]; then
    echo "Compiling Launcher Java code..."
    mkdir -p "$WORK_DIR/classes"
    javac -d "$WORK_DIR/classes" -cp "$PLATFORM" --release 8 "$SCRIPT_DIR/src/org/horizon/launcher/LauncherActivity.java"
    "$BUILD_TOOLS/d8" --lib "$PLATFORM" --output "$WORK_DIR" "$WORK_DIR/classes/org/horizon/launcher/"*.class
fi

# 5. Add classes.dex
if [ -f "$WORK_DIR/classes.dex" ]; then
    python3 -c "
import sys, zipfile
apk_path = sys.argv[1]
dex_path = sys.argv[2]
with zipfile.ZipFile(apk_path, 'a', compression=zipfile.ZIP_DEFLATED) as z:
    z.write(dex_path, 'classes.dex')
" "$WORK_DIR/unaligned.apk" "$WORK_DIR/classes.dex"
fi

# 6. Add native libraries (compiled Rust engine)
if [ -d "$SCRIPT_DIR/libs" ]; then
    python3 -c "
import sys, os, zipfile
apk_path = sys.argv[1]
libs_dir = sys.argv[2]
with zipfile.ZipFile(apk_path, 'a', compression=zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(libs_dir):
        for f in files:
            fp = os.path.join(root, f)
            arcname = os.path.join('lib', os.path.relpath(fp, libs_dir))
            z.write(fp, arcname)
" "$WORK_DIR/unaligned.apk" "$SCRIPT_DIR/libs"
fi

# 7. Zipalign
"$BUILD_TOOLS/zipalign" -f -v 4 "$WORK_DIR/unaligned.apk" "$OUT_DIR/horizon-mobile-26.3.apk"

# 8. Keystore & Sign
KEYSTORE="$WORK_DIR/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair \
        -keystore "$KEYSTORE" \
        -storepass android \
        -alias androiddebugkey \
        -keypass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US"
fi

"$BUILD_TOOLS/apksigner" sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:android \
    --ks-key-alias androiddebugkey \
    --key-pass pass:android \
    "$OUT_DIR/horizon-mobile-26.3.apk"

# Also copy to Downloads for user accessibility
mkdir -p "$HOME/Downloads"
cp "$OUT_DIR/horizon-mobile-26.3.apk" "$HOME/Downloads/horizon-mobile-26.3.apk"

echo "=== Successfully built and signed: $OUT_DIR/horizon-mobile-26.3.apk ==="
ls -lh "$OUT_DIR/horizon-mobile-26.3.apk"
