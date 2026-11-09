package org.horizon.launcher;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.Vibrator;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.WindowManager;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

// NOTE on coding style in this file: the toolchain here is javac 21 + d8 8.2.2,
// and d8 8.2.2 cannot dex anonymous classes or lambdas (NPE in
// String.length() during dexing). Everything must be named static nested
// classes. Do not "modernize" this file back to lambdas.

public class LauncherActivity extends Activity {
    private static final String TAG = "LauncherActivity";
    /** Minecraft version of the bundled engine (research-lock.json). */
    static final String BUNDLED_MC_VERSION = "26.3";
    private WebView webView;
    private LauncherBridge bridge;
    /** Путь рабочей папки, с которым загружен WebView (см. onResume). */
    private String lastBase;
    /**
     * Выбранная рабочая папка. Проверка записи делается один раз, а не на
     * каждый вызов exists/write из WebView (это были бы тысячи лишних
     * операций ввода-вывода). Сбрасывается в onResume, когда пользователь
     * мог вернуться с экрана разрешений.
     */
    private static volatile File sBaseCache;
    /** Держат установку живой, пока экран выключен или лаунчер свёрнут. */
    private static PowerManager.WakeLock sInstallWakeLock;
    private static WifiManager.WifiLock sInstallWifiLock;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                                 WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );

        // Keep the game and its downloads across updates: the working folder is
        // /sdcard/Horizon once "All files access" is granted, otherwise the
        // app-private media dir. Move whatever earlier builds left behind.
        invalidateBaseCache();
        lastBase = externalBase(this).getAbsolutePath();
        migrateLegacyData(this);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setBackgroundColor(0xFF0A0E14);
        bridge = new LauncherBridge(this);
        webView.addJavascriptInterface(bridge, "AndroidLauncher");

        webView.setWebChromeClient(new CustomChromeClient(this));
        webView.setWebViewClient(new CustomWebClient());

        webView.loadUrl("file:///android_asset/launcher/index.html");
        setContentView(webView);

        // Игровые данные должны лежать в /sdcard/Horizon: без «Доступа ко всем
        // файлам» пишем в app-specific папку, которая стирается при удалении.
        if (!hasAllFilesAccess(this)) askForFilesAccess();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            // Coming back from background: the WebView surface and the WebGL
            // context of the 3D stage need a re-layout/repaint kick, otherwise
            // the launcher can stay black. JS-side handles a context that is
            // still lost by re-creating the 3D viewer (skin-viewer.js).
            webView.invalidate();
        }

        // The game was paused and cannot restore its render surface: it asked
        // (game-restart.flag) for a restart in a fresh :game process. Done on
        // a worker thread: the dying :game process needs a moment to exit so
        // the relaunch gets a fresh one (winit allows one EventLoop per process).
        try {
            File marker = gameRestartFlag(this);
            if (marker.exists()) {
                marker.delete();
                Log.i(TAG, "Game restart requested: launching a fresh :game process");
                new Thread(new GameRelaunchTask(this), "game-relaunch").start();
            }
        } catch (Exception e) {
            Log.e(TAG, "Game restart failed", e);
        }

        // Возврат с экрана «Доступ ко всем файлам»: разрешение могли выдать.
        // Тогда переносим данные в /sdcard/Horizon и перезагружаем WebView,
        // чтобы все пути в интерфейсе указывали в новую папку.
        try {
            invalidateBaseCache();
            String base = externalBase(this).getAbsolutePath();
            if (lastBase != null && !base.equals(lastBase)) {
                // The engine may still be installing into the old folder; let
                // it stop before its files are moved, otherwise the resumed
                // install would keep writing to the old location.
                try {
                    if (bridge != null && bridge.isGameRunning()) bridge.killGameProcess();
                } catch (Exception ignored) {}
                lastBase = base;
                migrateLegacyData(this);
                if (webView != null) webView.reload();
                Log.i(TAG, "data dir switched to " + base);
            }
        } catch (Exception e) {
            Log.e(TAG, "data dir switch failed", e);
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    // ------------------------------------------------------------
    // System file picker plumbing: ACTION_OPEN_DOCUMENT started from the JS
    // bridge thread, result delivered here, bridge thread released via latch.
    // ------------------------------------------------------------
    private static volatile float sDlPercent = -1f;
    private static volatile long sDlBytes = 0;
    private static volatile long sDlTotal = 0;
    private static volatile String sDlStatus = "";
    private static final AtomicBoolean sDlRunning = new AtomicBoolean(false);

    private static volatile AtomicReference<String> sPendingPick = null;
    private static volatile CountDownLatch sPendingPickLatch = null;
    private static volatile String sPendingPickDest = null;

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != 42001) return;
        AtomicReference<String> picked = sPendingPick;
        CountDownLatch latch = sPendingPickLatch;
        String destRel = sPendingPickDest;
        sPendingPick = null;
        sPendingPickLatch = null;
        sPendingPickDest = null;
        if (picked == null || latch == null) return;

        try {
            if (resultCode != RESULT_OK || data == null || data.getData() == null) {
                picked.set(null);
                latch.countDown();
                return;
            }
            Uri uri = data.getData();
            String name = queryDisplayName(uri);
            if (name == null || name.isEmpty()) name = "picked-" + System.currentTimeMillis() + ".bin";
            name = name.replaceAll("[/\\\\]", "_");
            String destRelFull = (destRel == null || destRel.isEmpty()) ? "inbox/" + name : destRel + "/" + name;
            File dest = safeResolve(this, destRelFull);
            if (dest == null) {
                picked.set(null);
                latch.countDown();
                return;
            }
            InputStream in = getContentResolver().openInputStream(uri);
            FileOutputStream out = new FileOutputStream(dest);
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            out.flush();
            out.close();
            in.close();
            String rel = relPathOf(dest);
            picked.set("{\"ok\":true,\"name\":" + jsonStr(name)
                + ",\"relPath\":" + jsonStr(rel)
                + ",\"size\":" + dest.length() + "}");
        } catch (Exception e) {
            Log.e(TAG, "onActivityResult pick failed", e);
            picked.set(null);
        }
        latch.countDown();
    }

    private String queryDisplayName(Uri uri) {
        try {
            android.database.Cursor c = getContentResolver().query(uri, null, null, null, null);
            if (c != null) {
                try {
                    if (c.moveToFirst()) {
                        int idx = c.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME);
                        if (idx >= 0) return c.getString(idx);
                    }
                } finally {
                    c.close();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String relPathOf(File f) {
        String base = externalBase(this).getAbsolutePath();
        String full = f.getAbsolutePath();
        return full.startsWith(base) ? full.substring(base.length() + 1) : full;
    }

    /** Resolves relPath inside the app's external files dir; null when it escapes it. */
    static File safeResolve(Context ctx, String relPath) {
        try {
            File base = externalBase(ctx);
            String canonBase = base.getCanonicalPath();
            File target;
            if (relPath == null || relPath.trim().isEmpty() || relPath.equals("/") || relPath.equals(".")) {
                target = base;
            } else {
                target = new File(base, relPath);
            }
            String canon = target.getCanonicalPath();
            if (!canon.equals(canonBase) && !canon.startsWith(canonBase + File.separator)) {
                Log.w(TAG, "Blocked path escape attempt: " + relPath);
                return null;
            }
            return target;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Видимая пользователю папка игры на общей памяти:
     * /sdcard/Horizon. Она не принадлежит приложению, поэтому переживает и
     * обновление APK, и полное удаление приложения. Для записи по обычному
     * пути на Android 11+ нужно разрешение «Доступ ко всем файлам»
     * (MANAGE_EXTERNAL_STORAGE), которое выдаётся на системном экране.
     */
    static File publicBase() {
        return new File("/sdcard/Horizon");
    }

    /**
     * Запасная папка без разрешений: /sdcard/Android/media/&lt;pkg&gt;/files.
     * Работает всегда, но Android удаляет её вместе с приложением, поэтому
     * используется только пока «Доступ ко всем файлам» не выдан.
     */
    static File mediaBase(Context ctx) {
        return new File("/sdcard/Android/media/" + ctx.getPackageName() + "/files");
    }

    /** Выдано ли разрешение на запись в /sdcard/Horizon. */
    static boolean hasAllFilesAccess(Context ctx) {
        if (Build.VERSION.SDK_INT >= 30) {
            return android.os.Environment.isExternalStorageManager();
        }
        return ctx.checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
            == android.content.pm.PackageManager.PERMISSION_GRANTED;
    }

    /** Открывает системный экран «Доступ ко всем файлам» для этого приложения. */
    static void requestAllFilesAccess(Activity activity) {
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                intent.setData(Uri.parse("package:" + activity.getPackageName()));
                activity.startActivity(intent);
                return;
            } catch (Exception e) {
                Log.w(TAG, "per-app all-files screen unavailable: " + e.getMessage());
            }
            try {
                activity.startActivity(new Intent(android.provider.Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
            } catch (Exception e) {
                Log.e(TAG, "all-files settings unavailable", e);
            }
        } else {
            activity.requestPermissions(
                new String[] { android.Manifest.permission.WRITE_EXTERNAL_STORAGE }, 42002);
        }
    }

    static File externalBase(Context ctx) {
        File cached = sBaseCache;
        if (cached != null && cached.isDirectory()) return cached;
        synchronized (LauncherActivity.class) {
            cached = sBaseCache;
            if (cached != null && cached.isDirectory()) return cached;
            File chosen = chooseBase(ctx);
            sBaseCache = chosen;
            return chosen;
        }
    }

    /** Forget the cached working folder (permission may have changed). */
    static void invalidateBaseCache() {
        sBaseCache = null;
    }

    /**
     * Picks /sdcard/Horizon only when it is actually writable. After a full
     * reinstall the folder still exists but MANAGE_EXTERNAL_STORAGE is reset;
     * without this check the launcher would choose an unwritable folder and
     * every download would fail instead of using the media fallback.
     *
     * The order matches the engine (mobile.rs::android_home) exactly: the
     * launcher and the engine must always agree on the game folder, otherwise
     * the engine would install resources into one directory while the UI
     * checks another and the install would look endlessly unfinished.
     */
    private static File chooseBase(Context ctx) {
        File pub = publicBase();
        if (isWritableDir(pub)) return pub;
        File media = mediaBase(ctx);
        if (isWritableDir(media)) return media;
        File dir = ctx.getExternalFilesDir(null);
        if (isWritableDir(dir)) return dir;
        File files = ctx.getFilesDir();
        if (files != null) {
            if (!files.isDirectory()) files.mkdirs();
            return files;
        }
        return media;
    }

    /** Creates the directory if needed and checks that it can be written to. */
    static boolean isWritableDir(File dir) {
        if (dir == null) return false;
        try {
            if (!dir.isDirectory() && !dir.mkdirs()) return false;
            File probe = new File(dir, ".horizon-write-test");
            FileOutputStream out = new FileOutputStream(probe);
            try {
                out.write(new byte[] { 'o', 'k' });
                out.flush();
            } finally {
                out.close();
            }
            probe.delete();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Stamp of the installed APK. The bundled engine tables are re-extracted
     * whenever it changes, so an app update can never reuse tables from the
     * previous build (even when their files are the same size).
     */
    static String apkStamp(Context ctx) {
        try {
            android.content.pm.PackageInfo info =
                ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            return info.lastUpdateTime + ":" + info.versionCode + ":" + BUNDLED_MC_VERSION;
        } catch (Exception e) {
            return "0";
        }
    }

    /**
     * A zip is usable only when its central directory can be read and it
     * contains the resources marker the installer requires at the root.
     * Catches a copy interrupted by a full disk or a killed process.
     */
    static boolean isCompleteZip(File file) {
        if (file == null || !file.isFile() || file.length() < 22) return false;
        ZipFile zip = null;
        try {
            zip = new ZipFile(file);
            return zip.getEntry("horizon-resources.json") != null;
        } catch (Exception e) {
            return false;
        } finally {
            if (zip != null) {
                try { zip.close(); } catch (Exception ignored) {}
            }
        }
    }

    /** SHA-1 of a file as lowercase hex; null when it cannot be read. */
    static String sha1Hex(File file) {
        FileInputStream in = null;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-1");
            in = new FileInputStream(file);
            byte[] buffer = new byte[262144];
            int read;
            while ((read = in.read(buffer)) > 0) digest.update(buffer, 0, read);
            byte[] sum = digest.digest();
            StringBuilder sb = new StringBuilder(sum.length * 2);
            for (byte b : sum) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            Log.w(TAG, "sha1Hex failed: " + file, e);
            return null;
        } finally {
            if (in != null) {
                try { in.close(); } catch (Exception ignored) {}
            }
        }
    }

    static String readSmallText(File file) {        if (file == null || !file.isFile() || file.length() > 4096) return "";
        try {
            BufferedReader reader = new BufferedReader(new FileReader(file));
            try {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                return sb.toString().trim();
            } finally {
                reader.close();
            }
        } catch (Exception e) {
            return "";
        }
    }

    static boolean writeSmallText(File file, String text) {
        try {
            File parent = file.getParentFile();
            if (parent != null && !parent.isDirectory() && !parent.mkdirs()) return false;
            FileWriter writer = new FileWriter(file);
            try {
                writer.write(text);
                writer.flush();
            } finally {
                writer.close();
            }
            return true;
        } catch (Exception e) {
            Log.w(TAG, "writeSmallText failed: " + file, e);
            return false;
        }
    }

    /** Both markers must exist (see official_install.rs resources_ready). */
    static boolean resourcesReady(File home) {
        File resources = new File(home, "resources");
        return new File(resources, "horizon-resources.json").isFile()
            && new File(resources, "asset-index.json").isFile();
    }

    // ------------------------------------------------------------
    // Installation keep-alive: a foreground service in the :game process
    // (the one that actually downloads) plus wake/wifi locks, so Android
    // does not freeze the installer when the screen turns off.
    // ------------------------------------------------------------

    static boolean acquireInstallWakeLock(Context ctx) {
        try {
            if (sInstallWakeLock == null) {
                PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
                if (pm == null) return false;
                sInstallWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "horizon:install");
                sInstallWakeLock.setReferenceCounted(false);
            }
            if (!sInstallWakeLock.isHeld()) sInstallWakeLock.acquire();
            if (sInstallWifiLock == null) {
                WifiManager wm = (WifiManager) ctx.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) {
                    sInstallWifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "horizon:install-wifi");
                    sInstallWifiLock.setReferenceCounted(false);
                }
            }
            if (sInstallWifiLock != null && !sInstallWifiLock.isHeld()) sInstallWifiLock.acquire();
            return true;
        } catch (Exception e) {
            Log.w(TAG, "acquireInstallWakeLock failed", e);
            return false;
        }
    }

    static void releaseInstallWakeLock() {
        try {
            if (sInstallWakeLock != null && sInstallWakeLock.isHeld()) sInstallWakeLock.release();
        } catch (Exception e) {
            Log.w(TAG, "releaseInstallWakeLock failed", e);
        }
        try {
            if (sInstallWifiLock != null && sInstallWifiLock.isHeld()) sInstallWifiLock.release();
        } catch (Exception e) {
            Log.w(TAG, "releaseInstallWifiLock failed", e);
        }
    }

    static boolean startInstallService(Context ctx) {
        try {
            Intent intent = new Intent(ctx, InstallService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(intent);
            } else {
                ctx.startService(intent);
            }
            return true;
        } catch (Exception e) {
            Log.e(TAG, "startInstallService failed", e);
            return false;
        }
    }

    static void stopInstallService(Context ctx) {
        try {
            ctx.stopService(new Intent(ctx, InstallService.class));
        } catch (Exception e) {
            Log.w(TAG, "stopInstallService failed", e);
        }
    }

    /**
     * Переносит уже скачанные данные из старых папок (Android/data и
     * Android/media) в текущую рабочую (/sdcard/Horizon после выдачи
     * разрешения). Частичный перенос безопасен: исходный файл удаляется
     * только после успешной проверки размера.
     */
    static void migrateLegacyData(Context ctx) {
        try {
            File target = externalBase(ctx);
            File[] sources = new File[] { ctx.getExternalFilesDir(null), mediaBase(ctx) };
            String targetPath = target.getCanonicalPath();
            if (!target.isDirectory() && !target.mkdirs()) return;
            for (File source : sources) {
                if (source == null || !source.isDirectory()) continue;
                if (source.getCanonicalPath().equals(targetPath)) continue;
                File[] children = source.listFiles();
                if (children == null) continue;
                for (File src : children) {
                    File dst = new File(target, src.getName());
                    if (dst.exists()) {
                        if (dirSize(src) == dirSize(dst) && dirSize(src) >= 0) deleteRecursive(src);
                        continue;
                    }
                    boolean moved = src.renameTo(dst);
                    if (!moved) {
                        try {
                            copyTree(src, dst);
                            moved = dirSize(src) == dirSize(dst) && dirSize(src) >= 0;
                        } catch (Exception e) {
                            Log.e(TAG, "migrate copy failed: " + src.getName(), e);
                        }
                    }
                    if (moved) {
                        if (src.exists()) deleteRecursive(src);
                        Log.i(TAG, "migrated " + src.getName() + " to " + targetPath);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "data migration failed", e);
        }
    }

    static class StorageAllowListener implements DialogInterface.OnClickListener {
        private final LauncherActivity activity;
        StorageAllowListener(LauncherActivity activity) { this.activity = activity; }
        @Override
        public void onClick(DialogInterface d, int w) {
            requestAllFilesAccess(activity);
        }
    }

    /** Объясняет, зачем нужен доступ к файлам, и ведёт на системный экран. */
    private void askForFilesAccess() {
        new AlertDialog.Builder(this)
            .setTitle("Доступ к файлам")
            .setMessage("Ресурсы игры, миры и настройки будут лежать в папке "
                + publicBase().getAbsolutePath()
                + " и не пропадут при обновлении или удалении приложения.\n\n"
                + "На следующем экране включите «Разрешить управление всеми файлами» "
                + "для Horizon Minecraft 26.3 и вернитесь назад.")
            .setPositiveButton("Разрешить", new StorageAllowListener(this))
            .setNegativeButton("Позже", null)
            .show();
    }

    static boolean deleteRecursive(File f) {
        if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) {
                for (File c : children) {
                    if (!deleteRecursive(c)) return false;
                }
            }
        }
        return f.delete();
    }

    static void copyTree(File src, File dst) throws Exception {
        if (src.isDirectory()) {
            if (!dst.isDirectory() && !dst.mkdirs()) throw new Exception("mkdirs " + dst);
            File[] children = src.listFiles();
            if (children != null) {
                for (File c : children) copyTree(c, new File(dst, c.getName()));
            }
            return;
        }
        File parent = dst.getParentFile();
        if (parent != null && !parent.isDirectory() && !parent.mkdirs()) throw new Exception("mkdirs " + parent);
        FileInputStream in = new FileInputStream(src);
        try {
            FileOutputStream out = new FileOutputStream(dst);
            try {
                byte[] buf = new byte[262144];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                out.flush();
            } finally {
                out.close();
            }
        } finally {
            in.close();
        }
        dst.setLastModified(src.lastModified());
    }

    /** Total byte size of a file tree, or -1 when some file cannot be read. */
    static long dirSize(File f) {
        if (f.isFile()) {
            long len = f.length();
            return len;
        }
        if (!f.isDirectory()) return -1;
        File[] children = f.listFiles();
        if (children == null) return -1;
        long total = 0;
        for (File c : children) {
            long s = dirSize(c);
            if (s < 0) return -1;
            total += s;
        }
        return total;
    }

    static String jsonStr(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }

    // ============================================================
    // Named runnable / listener classes (no anonymous classes, no lambdas)
    // ============================================================

    static class JsConfirmListener implements DialogInterface.OnClickListener {
        private final JsResult result;
        private final boolean confirm;
        JsConfirmListener(JsResult result, boolean confirm) {
            this.result = result;
            this.confirm = confirm;
        }
        @Override
        public void onClick(DialogInterface d, int w) {
            if (confirm) result.confirm(); else result.cancel();
        }
    }

    static class JsCancelListener implements DialogInterface.OnCancelListener {
        private final JsResult result;
        JsCancelListener(JsResult result) { this.result = result; }
        @Override
        public void onCancel(DialogInterface d) { result.cancel(); }
    }

    static class JsDialogTask implements Runnable {
        private final LauncherActivity activity;
        private final String message;
        private final JsResult result;
        private final String positiveText;
        private final boolean confirmOnPositive;
        JsDialogTask(LauncherActivity activity, String message, JsResult result,
                     String positiveText, boolean confirmOnPositive) {
            this.activity = activity;
            this.message = message;
            this.result = result;
            this.positiveText = positiveText;
            this.confirmOnPositive = confirmOnPositive;
        }
        @Override
        public void run() {
            AlertDialog.Builder b = new AlertDialog.Builder(activity);
            b.setMessage(message);
            b.setPositiveButton(positiveText, new JsConfirmListener(result, confirmOnPositive));
            b.setOnCancelListener(new JsCancelListener(result));
            b.show();
        }
    }

    static class PickStartTask implements Runnable {
        private final Activity activity;
        PickStartTask(Activity activity) { this.activity = activity; }
        @Override
        public void run() {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("*/*");
            try {
                activity.startActivityForResult(intent, 42001);
            } catch (Exception e) {
                Log.e(TAG, "pickFile failed to start", e);
                AtomicReference<String> picked = sPendingPick;
                CountDownLatch latch = sPendingPickLatch;
                if (latch != null) latch.countDown();
                if (picked != null) picked.set(null);
            }
        }
    }

    static class CacheFetchTask implements Runnable {
        private final LauncherBridge bridge;
        private final String url;
        private final String key;
        CacheFetchTask(LauncherBridge bridge, String url, String key) {
            this.bridge = bridge;
            this.url = url;
            this.key = key;
        }
        @Override
        public void run() {
            String body = bridge.httpGetString(url, 5000);
            if (body != null) {
                synchronized (bridge.sHttpCache) {
                    bridge.sHttpCache.put(key, body);
                }
            }
        }
    }

    static class DownloadTask implements Runnable {
        private final String url;
        private final File dest;
        DownloadTask(String url, File dest) {
            this.url = url;
            this.dest = dest;
        }
        @Override
        public void run() {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(30000);
                conn.setRequestProperty("User-Agent", "Burmalda-Launcher-Android/1.0");
                conn.setInstanceFollowRedirects(true);
                int code = conn.getResponseCode();
                if (code >= 300 || code < 200) throw new Exception("HTTP " + code);
                long total = conn.getContentLength();
                sDlTotal = total;
                File tmp = new File(dest.getAbsolutePath() + ".part");
                InputStream in = conn.getInputStream();
                FileOutputStream out = new FileOutputStream(tmp);
                byte[] buf = new byte[65536];
                long done = 0;
                int n;
                while ((n = in.read(buf)) > 0) {
                    out.write(buf, 0, n);
                    done += n;
                    sDlBytes = done;
                    if (total > 0) {
                        sDlPercent = Math.min(99f, done * 100f / total);
                        sDlStatus = "Загрузка: " + (done / 1048576) + " МБ / " + (total / 1048576) + " МБ";
                    } else {
                        sDlStatus = "Загрузка: " + (done / 1048576) + " МБ";
                    }
                }
                out.flush();
                out.close();
                in.close();
                File parent = dest.getParentFile();
                if (parent != null && !parent.exists()) parent.mkdirs();
                if (dest.exists()) dest.delete();
                if (!tmp.renameTo(dest)) throw new Exception("rename failed");
                sDlPercent = 100;
                sDlStatus = "Готово";
            } catch (Exception e) {
                Log.e(TAG, "download failed", e);
                sDlStatus = "Ошибка: " + e.getMessage();
                sDlPercent = -1;
            } finally {
                sDlRunning.set(false);
            }
        }
    }

    static class ToastTask implements Runnable {
        private final Activity activity;
        private final String message;
        ToastTask(Activity activity, String message) {
            this.activity = activity;
            this.message = message;
        }
        @Override
        public void run() {
            android.widget.Toast.makeText(activity, message, android.widget.Toast.LENGTH_SHORT).show();
        }
    }

    /** Вызов системного экрана «Доступ ко всем файлам» из UI-потока. */
    static class FilesAccessTask implements Runnable {
        private final Activity activity;
        FilesAccessTask(Activity activity) { this.activity = activity; }
        @Override
        public void run() {
            requestAllFilesAccess(activity);
        }
    }

    // ============================================================

    // static: d8 8.2.2 + javac 21 cannot dex non-static inner classes
    public static class CustomChromeClient extends WebChromeClient {
        private final LauncherActivity activity;

        CustomChromeClient(LauncherActivity activity) {
            this.activity = activity;
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage cm) {
            Log.d("LauncherJS", cm.message() + " [" + cm.sourceId() + ":" + cm.lineNumber() + "]");
            return true;
        }

        // alert() / confirm() must actually show and return a result: without
        // this the default WebChromeClient cancels every confirm(), so renderer
        // code like "confirm(...)" in modpack deletion never proceeds.
        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            activity.runOnUiThread(new JsDialogTask(activity, message, result, "OK", true));
            return true;
        }

        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            activity.runOnUiThread(new JsDialogTask(activity, message, result, "Удалить", true));
            return true;
        }
    }

    public static class CustomWebClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            Log.i(TAG, "WebView finished loading: " + url);
        }
    }

    // ------------------------------------------------------------
    // Game activity (runs in the :game process, declared in the manifest).
    // The engine renders through a Vulkan (wgpu) surface that it cannot
    // re-acquire after the activity was paused (HOME / recents / power
    // menu): the process lives on but the screen stays black forever.
    // Fix on the launcher side: when resumed after a pause, restart the
    // game in a fresh :game process (fresh surface). Also, the manifest
    // sets windowSoftInputMode=adjustNothing so the IME never resizes the
    // game surface (resize black-screened the renderer too).
    // ------------------------------------------------------------

    static class GameProcessExitTask implements Runnable {
        public void run() {
            android.os.Process.killProcess(android.os.Process.myPid());
        }
    }

    /** Restarts the game in a fresh :game process (see LauncherActivity.onResume). */
    static class GameRelaunchTask implements Runnable {
        private final LauncherActivity activity;
        GameRelaunchTask(LauncherActivity activity) { this.activity = activity; }
        @Override
        public void run() {
            try {
                if (activity.bridge != null && activity.bridge.isGameRunning()) {
                    activity.bridge.killGameProcess();
                    Thread.sleep(700);
                }
                activity.startActivity(new Intent(activity, GameActivity.class));
            } catch (Exception e) {
                Log.e(TAG, "Game relaunch failed", e);
            }
        }
    }

    /** Marker file: the game was paused and must be restarted (see GameActivity). */
    static File gameRestartFlag(Context ctx) {
        return new File(externalBase(ctx), "game-restart.flag");
    }

    public static class GameActivity extends android.app.NativeActivity {
        public GameActivity() {
        }
    }

    /**
     * Foreground service in the :game process (the process running the
     * engine installer). Keeps Android from freezing/killing the download
     * when the screen turns off or the launcher is swiped away, and shows a
     * normal ongoing notification. It stops itself as soon as the install
     * flag is gone, i.e. after "done"/"error" or a killed engine.
     */
    public static class InstallService extends Service {
        private static final String CHANNEL_ID = "horizon-install";
        private static final int NOTIFICATION_ID = 4210;
        private volatile boolean stopping;

        @Override
        public IBinder onBind(Intent intent) {
            return null;
        }

        @Override
        public void onCreate() {
            super.onCreate();
            boolean foregroundStarted = false;
            try {
                NotificationManager nm =
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Установка Minecraft",
                        NotificationManager.IMPORTANCE_LOW);
                    channel.setDescription("Загрузка ресурсов Minecraft " + BUNDLED_MC_VERSION);
                    channel.setShowBadge(false);
                    nm.createNotificationChannel(channel);
                }
                Intent open = new Intent(this, LauncherActivity.class);
                open.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                PendingIntent pending = PendingIntent.getActivity(
                    this, 0, open,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                Notification.Builder builder;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    builder = new Notification.Builder(this, CHANNEL_ID);
                } else {
                    builder = new Notification.Builder(this);
                }
                builder.setSmallIcon(android.R.drawable.stat_sys_download)
                    .setContentTitle("Minecraft " + BUNDLED_MC_VERSION)
                    .setContentText("Установка ресурсов…")
                    .setOngoing(true)
                    .setOnlyAlertOnce(true)
                    .setContentIntent(pending);
                Notification notification = builder.build();
                if (Build.VERSION.SDK_INT >= 29) {
                    startForeground(NOTIFICATION_ID, notification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
                foregroundStarted = true;
            } catch (Exception e) {
                // Without startForeground the system would report a broken
                // service; stop cleanly instead. The install itself is not
                // affected (the launcher-side wake lock still applies).
                Log.e(TAG, "InstallService startForeground failed", e);
            }
            if (!foregroundStarted) {
                stopSelf();
                return;
            }
            acquireInstallWakeLock(this);
            new Thread(new InstallPollTask(this), "horizon-install-service").start();
        }

        @Override
        public int onStartCommand(Intent intent, int flags, int startId) {
            return START_NOT_STICKY;
        }

        @Override
        public void onDestroy() {
            stopping = true;
            releaseInstallWakeLock();
            try {
                stopForeground(true);
            } catch (Exception ignored) {}
            super.onDestroy();
        }

        void finishService() {
            stopping = true;
            releaseInstallWakeLock();
            try {
                stopForeground(true);
            } catch (Exception ignored) {}
            stopSelf();
        }
    }

    /** Watches the install flag so the service dies with the installation. */
    static class InstallPollTask implements Runnable {
        private final InstallService service;
        InstallPollTask(InstallService service) {
            this.service = service;
        }
        @Override
        public void run() {
            long started = System.currentTimeMillis();
            while (!service.stopping) {
                try {
                    File home = externalBase(service);
                    File flag = new File(home, "install-assets.flag");
                    if (!flag.isFile()) {
                        // "done"/"error" is written before the flag is removed;
                        // either way the launcher now owns the result.
                        service.finishService();
                        return;
                    }
                    // Guard against a lost flag/engine and an endlessly
                    // visible notification; the launcher's own watchdog
                    // reports the error long before this.
                    if (System.currentTimeMillis() - started > 3L * 60L * 60L * 1000L) {
                        service.finishService();
                        return;
                    }
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    return;
                } catch (Exception e) {
                    Log.w(TAG, "install service poll failed", e);
                }
                if (service.stopping) return;
            }
        }
    }

    public static class LauncherBridge {
        private final Activity activity;
        private final HashMap<String, String> sHttpCache = new HashMap<>();

        public LauncherBridge(Activity activity) {
            this.activity = activity;
        }

        private File baseDir() {
            return externalBase(activity);
        }

        // ------------------------------------------------------------
        // File operations (all paths are relative to the app files dir)
        // ------------------------------------------------------------

        @JavascriptInterface
        public String getFilesPath() {
            return baseDir().getAbsolutePath();
        }

        /** Выдано ли разрешение «Доступ ко всем файлам» (/sdcard/Horizon). */
        @JavascriptInterface
        public boolean hasFilesAccess() {
            return hasAllFilesAccess(activity);
        }

        /** Открывает системный экран выдачи «Доступа ко всем файлам». */
        @JavascriptInterface
        public void requestFilesAccess() {
            activity.runOnUiThread(new FilesAccessTask(activity));
        }

        @JavascriptInterface
        public boolean exists(String relPath) {
            File f = safeResolve(activity, relPath);
            return f != null && f.exists();
        }

        @JavascriptInterface
        public boolean isDirectory(String relPath) {
            File f = safeResolve(activity, relPath);
            return f != null && f.isDirectory();
        }

        @JavascriptInterface
        public void mkdir(String relPath) {
            File f = safeResolve(activity, relPath);
            if (f != null) f.mkdirs();
        }

        @JavascriptInterface
        public String listDir(String relPath) {
            File dir = safeResolve(activity, relPath);
            if (dir == null || !dir.isDirectory()) return "[]";
            File[] files = dir.listFiles();
            if (files == null) return "[]";
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (File f : files) {
                if (!first) sb.append(',');
                first = false;
                sb.append("{\"name\":").append(jsonStr(f.getName()))
                  .append(",\"isDir\":").append(f.isDirectory())
                  .append(",\"size\":").append(f.length())
                  .append(",\"mtime\":").append(f.lastModified())
                  .append('}');
            }
            return sb.append(']').toString();
        }

        @JavascriptInterface
        public boolean deletePath(String relPath) {
            File f = safeResolve(activity, relPath);
            if (f == null || !f.exists()) return false;
            return deleteRecursive(f);
        }

        private boolean deleteRecursive(File f) {
            if (f.isDirectory()) {
                File[] children = f.listFiles();
                if (children != null) {
                    for (File c : children) {
                        if (!deleteRecursive(c)) return false;
                    }
                }
            }
            return f.delete();
        }

        @JavascriptInterface
        public boolean renamePath(String fromRel, String toRel) {
            File from = safeResolve(activity, fromRel);
            File to = safeResolve(activity, toRel);
            if (from == null || to == null) return false;
            return from.renameTo(to);
        }

        @JavascriptInterface
        public boolean copyFile(String fromRel, String toRel) {
            File from = safeResolve(activity, fromRel);
            File to = safeResolve(activity, toRel);
            if (from == null || to == null || !from.isFile()) return false;
            return copyStreamToFile(from.getAbsolutePath(), to);
        }

        private boolean copyStreamToFile(String sourcePath, File dest) {
            try {
                File parent = dest.getParentFile();
                if (parent != null && !parent.exists()) parent.mkdirs();
                FileInputStream in = new FileInputStream(sourcePath);
                FileOutputStream out = new FileOutputStream(dest);
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                out.flush();
                out.close();
                in.close();
                return true;
            } catch (Exception e) {
                Log.e(TAG, "copyStreamToFile failed", e);
                return false;
            }
        }

        @JavascriptInterface
        public String readFileText(String relPath) {
            File f = safeResolve(activity, relPath);
            if (f == null || !f.isFile()) return null;
            try {
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                FileInputStream in = new FileInputStream(f);
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                in.close();
                return new String(bos.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return null;
            }
        }

        @JavascriptInterface
        public String readFileBase64(String relPath) {
            File f = safeResolve(activity, relPath);
            if (f == null || !f.isFile()) return null;
            try {
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                FileInputStream in = new FileInputStream(f);
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                in.close();
                return android.util.Base64.encodeToString(bos.toByteArray(), android.util.Base64.NO_WRAP);
            } catch (Exception e) {
                return null;
            }
        }

        /** text: plain UTF-8 text; set base64=true to write binary from base64. */
        @JavascriptInterface
        public boolean writeFileText(String relPath, String text, boolean base64) {
            File f = safeResolve(activity, relPath);
            if (f == null) return false;
            try {
                File parent = f.getParentFile();
                if (parent != null && !parent.exists()) parent.mkdirs();
                FileOutputStream out = new FileOutputStream(f);
                byte[] data = base64
                    ? android.util.Base64.decode(text, android.util.Base64.NO_WRAP)
                    : text.getBytes(StandardCharsets.UTF_8);
                out.write(data);
                out.flush();
                out.close();
                return true;
            } catch (Exception e) {
                Log.e(TAG, "writeFileText failed", e);
                return false;
            }
        }

        /** Reads one entry out of a zip file (used to extract horizon-mod.toml manifest ids). */
        @JavascriptInterface
        public String readZipEntry(String relPath, String entryName) {
            File f = safeResolve(activity, relPath);
            if (f == null || !f.isFile()) return null;
            ZipFile zip = null;
            try {
                zip = new ZipFile(f);
                ZipEntry entry = zip.getEntry(entryName);
                if (entry == null) {
                    java.util.Enumeration<? extends ZipEntry> en = zip.entries();
                    while (en.hasMoreElements()) {
                        ZipEntry e = en.nextElement();
                        if (e.getName().endsWith(entryName)) { entry = e; break; }
                    }
                }
                if (entry == null) return null;
                InputStream in = zip.getInputStream(entry);
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                in.close();
                return new String(bos.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return null;
            } finally {
                if (zip != null) {
                    try { zip.close(); } catch (Exception ignored) {}
                }
            }
        }

        /** Reads a bundled APK asset (e.g. "launcher/assets/horizon_releases.json"). */
        @JavascriptInterface
        public String readAssetText(String assetPath) {
            try {
                InputStream in = activity.getAssets().open(assetPath);
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                in.close();
                return new String(bos.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return null;
            }
        }

        // ------------------------------------------------------------
        // System file picker (content:// URIs cannot be read by path).
        // Copies the picked document into files/<destRel> and returns JSON.
        // ------------------------------------------------------------
        @JavascriptInterface
        public String pickFile(final String destRel, final String extensions) {
            final AtomicReference<String> picked = new AtomicReference<>(null);
            final CountDownLatch latch = new CountDownLatch(1);
            synchronized (LauncherActivity.class) {
                sPendingPick = picked;
                sPendingPickLatch = latch;
                sPendingPickDest = destRel;
            }
            activity.runOnUiThread(new PickStartTask(activity));
            try {
                latch.await();
            } catch (InterruptedException ignored) {}
            return picked.get();
        }

        // ------------------------------------------------------------
        // HTTP (blocking, short timeouts; call from JS with care)
        // ------------------------------------------------------------

        @JavascriptInterface
        public String httpGetString(String url) {
            return httpGetString(url, 5000);
        }

        private String httpGetString(String url, int timeoutMs) {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(timeoutMs);
                conn.setReadTimeout(timeoutMs);
                conn.setRequestProperty("User-Agent", "Burmalda-Launcher-Android/1.0");
                conn.setRequestProperty("Accept", "*/*");
                int code = conn.getResponseCode();
                if (code < 200 || code >= 300) return null;
                InputStream in = conn.getInputStream();
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                in.close();
                return new String(bos.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                Log.w(TAG, "httpGetString failed: " + url + ": " + e.getMessage());
                return null;
            }
        }

        /** Downloads url in the background into files/<destRel>; progress is polled via getDownloadProgress(). */
        @JavascriptInterface
        public boolean downloadFileAsync(final String url, final String destRel) {
            if (!sDlRunning.compareAndSet(false, true)) return false;
            sDlPercent = 0;
            sDlBytes = 0;
            sDlTotal = 0;
            sDlStatus = "Подключение...";
            final File dest = safeResolve(activity, destRel);
            if (dest == null) {
                sDlRunning.set(false);
                sDlStatus = "Недопустимый путь";
                return false;
            }
            new Thread(new DownloadTask(url, dest), "horizon-download").start();
            return true;
        }

        @JavascriptInterface
        public boolean isDownloading() {
            return sDlRunning.get();
        }

        @JavascriptInterface
        public String getDownloadProgress() {
            return "{\"running\":" + sDlRunning.get()
                + ",\"percent\":" + sDlPercent
                + ",\"downloadedBytes\":" + sDlBytes
                + ",\"totalBytes\":" + sDlTotal
                + ",\"status\":" + jsonStr(sDlStatus) + "}";
        }

        /** Refreshes a URL into the in-memory cache on a background thread (non-blocking). */
        @JavascriptInterface
        public void refreshHttpCache(final String url, final String key) {
            new Thread(new CacheFetchTask(this, url, key), "horizon-http-cache").start();
        }

        @JavascriptInterface
        public String getHttpCache(String key) {
            synchronized (sHttpCache) {
                return sHttpCache.get(key);
            }
        }

        // ------------------------------------------------------------
        // Game process control
        // ------------------------------------------------------------

        @JavascriptInterface
        public boolean isGameRunning() {
            return findGamePid() != 0;
        }

        @JavascriptInterface
        public boolean killGameProcess() {
            int pid = findGamePid();
            if (pid == 0) return false;
            try {
                android.os.Process.killProcess(pid);
                return true;
            } catch (Exception e) {
                Log.e(TAG, "killGameProcess failed", e);
                return false;
            }
        }

        private int findGamePid() {
            try {
                ActivityManager am = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
                if (am == null) return 0;
                List<ActivityManager.RunningAppProcessInfo> procs = am.getRunningAppProcesses();
                if (procs == null) return 0;
                String gameName = activity.getPackageName() + ":game";
                for (int i = 0; i < procs.size(); i++) {
                    ActivityManager.RunningAppProcessInfo p = procs.get(i);
                    if (gameName.equals(p.processName)) return p.pid;
                }
            } catch (Exception ignored) {}
            return 0;
        }

        // ------------------------------------------------------------
        // Misc
        // ------------------------------------------------------------

        @JavascriptInterface
        public void openUrl(String url) {
            try {
                if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) return;
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                activity.startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "openUrl failed", e);
            }
        }

        // ------------------------------------------------------------
        // Engine tables for the on-device asset installer. The installer
        // (official_install.rs) prefers a launcher-supplied bundle at
        // <files>/engine-data-<mc>.zip over the APK asset, so we materialize
        // the bundled asset into the files dir before requesting an install.
        //
        // The copy is atomic (".part" + rename) and stamped with the APK's
        // lastUpdateTime: an update replaces the tables, while retries reuse
        // them without another 14 MB copy. A truncated zip is never accepted.
        // ------------------------------------------------------------

        private static final String ENGINE_ASSET = "engine-data.zip";
        private static final String ENGINE_ZIP = "engine-data-" + BUNDLED_MC_VERSION + ".zip";

        @JavascriptInterface
        public boolean prepareEngineData(String engineTag) {
            try {
                File dest = safeResolve(activity, ENGINE_ZIP);
                if (dest == null) return false;
                File stampFile = new File(dest.getAbsolutePath() + ".stamp");
                String apk = apkStamp(activity);
                if (dest.isFile() && dest.length() > 0 && isCompleteZip(dest)) {
                    String stored = readSmallText(stampFile);
                    int separator = stored.lastIndexOf(':');
                    if (separator > 0 && stored.substring(0, separator).equals(apk)) {
                        String expected = stored.substring(separator + 1);
                        String actual = sha1Hex(dest);
                        if (actual != null && actual.equals(expected)) {
                            Log.i(TAG, "engine-data already staged (" + engineTag + ")");
                            return true;
                        }
                    }
                    // A zip can still open (its central directory is intact)
                    // while an entry inside is damaged. Reusing it would make
                    // every retry fail at extraction, so the hash above sends
                    // us back to the known-good APK asset.
                    Log.w(TAG, "staged engine-data is stale or damaged; recopying");
                }
                File part = new File(dest.getAbsolutePath() + ".part");
                try {
                    part.delete();
                    InputStream in = activity.getAssets().open(ENGINE_ASSET);
                    FileOutputStream out = new FileOutputStream(part);
                    try {
                        byte[] buf = new byte[262144];
                        int n;
                        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                        out.flush();
                        try { out.getFD().sync(); } catch (Exception ignored) {}
                    } finally {
                        out.close();
                        in.close();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "engine-data copy failed", e);
                    part.delete();
                    return false;
                }
                if (!isCompleteZip(part)) {
                    Log.e(TAG, "bundled " + ENGINE_ASSET + " is missing or truncated");
                    part.delete();
                    return false;
                }
                boolean moved = part.renameTo(dest);
                if (!moved) {
                    dest.delete();
                    moved = part.renameTo(dest);
                }
                if (!moved) {
                    Log.e(TAG, "cannot activate " + dest);
                    part.delete();
                    return false;
                }
                // Written last: while the stamp is absent a later run simply
                // validates and reuses the file instead of trusting it.
                String hash = sha1Hex(dest);
                if (hash == null) {
                    Log.e(TAG, "cannot hash staged " + dest);
                    dest.delete();
                    return false;
                }
                writeSmallText(stampFile, apk + ":" + hash);
                Log.i(TAG, "engine-data staged: " + dest.length() + " bytes");
                return dest.length() > 0;
            } catch (Exception e) {
                Log.e(TAG, "prepareEngineData failed", e);
                return false;
            }
        }

        @JavascriptInterface
        public boolean acquireInstallWakeLock() {
            return LauncherActivity.acquireInstallWakeLock(activity);
        }

        @JavascriptInterface
        public void releaseInstallWakeLock() {
            LauncherActivity.releaseInstallWakeLock();
        }

        @JavascriptInterface
        public boolean startInstallService() {
            return LauncherActivity.startInstallService(activity);
        }

        @JavascriptInterface
        public void stopInstallService() {
            LauncherActivity.stopInstallService(activity);
        }

        @JavascriptInterface
        public void launchGame(String username) {
            Log.i(TAG, "Starting NativeActivity with player: " + username);
            try {
                File dir = baseDir();
                if (dir != null) {
                    File playerFile = new File(dir, "horizon-player.txt");
                    if (playerFile.exists() && !playerFile.canWrite()) {
                        playerFile.delete();
                    }
                    FileWriter writer = new FileWriter(playerFile);
                    writer.write("name:" + username.trim() + "\n");
                    writer.close();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error writing player name, retrying with force delete", e);
                try {
                    File playerFile = new File(baseDir(), "horizon-player.txt");
                    playerFile.delete();
                    FileWriter writer = new FileWriter(playerFile);
                    writer.write("name:" + username.trim() + "\n");
                    writer.close();
                } catch (Exception ignored) {}
            }

            // Asset-install runs (install-assets.flag present) show a plain
            // black engine window while the resources download from Mojang.
            // The engine needs its window created to get through startup, so
            // let it run in the foreground until it reports progress, then
            // bring the launcher WebView back on top: the user watches the
            // launcher progress bar instead of the black engine window.
            //
            // The flag is owned by the JS bridge: it also covers "resume after
            // the app was killed", so this method must never delete it here
            // (an old install may have only horizon-resources.json).
            boolean installing = new File(baseDir(), "install-assets.flag").isFile();
            if (installing) LauncherActivity.startInstallService(activity);

            // The engine reads the install flag only at process start and
            // exits when done, so every launch must run in a fresh :game
            // process: kill any cached/leftover one first.
            try {
                int stale = findGamePid();
                if (stale != 0) {
                    Log.i(TAG, "Killing stale :game process " + stale);
                    android.os.Process.killProcess(stale);
                    Thread.sleep(400);
                }
            } catch (Exception e) {
                Log.w(TAG, "stale :game cleanup failed", e);
            }

            Intent intent = new Intent(activity, GameActivity.class);
            if (installing) intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
            activity.startActivity(intent);

            if (installing) {
                File progress = new File(baseDir(), "install-progress.txt");
                long deadline = System.currentTimeMillis() + 8000;
                while (System.currentTimeMillis() < deadline) {
                    if (progress.isFile() && progress.length() > 0) break;
                    try { Thread.sleep(200); } catch (InterruptedException e) { break; }
                }
                if (progress.isFile() && progress.length() > 0) {
                    Log.i(TAG, "Engine is installing resources; returning launcher UI to front");
                    Intent self = new Intent(activity, LauncherActivity.class);
                    self.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    activity.startActivity(self);
                }
            }
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(ms);
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void toast(String message) {
            activity.runOnUiThread(new ToastTask(activity, message));
        }

        @JavascriptInterface
        public void log(String message) {
            Log.i("LauncherJS", message);
        }
    }
}
