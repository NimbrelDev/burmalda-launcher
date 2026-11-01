package org.horizon.launcher;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
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
    private WebView webView;
    private LauncherBridge bridge;

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

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
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

    static File externalBase(Context ctx) {
        File dir = ctx.getExternalFilesDir(null);
        if (dir == null) dir = ctx.getFilesDir();
        return dir;
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

        // When the user leaves the game (HOME / recents), keep the activity
        // RESUMED inside a Picture-in-Picture window instead of stopping it:
        // the engine's Vulkan surface is then never destroyed, the game keeps
        // running in the small window, and returning restores the exact same
        // state (world, position). A plain pause/stop destroys the surface
        // and the engine cannot re-acquire it (black screen on return).
        @Override
        public void onUserLeaveHint() {
            try {
                android.app.PictureInPictureParams params =
                    new android.app.PictureInPictureParams.Builder()
                        .setAspectRatio(new android.util.Rational(16, 9))
                        .build();
                enterPictureInPictureMode(params);
            } catch (Exception e) {
                Log.w(TAG, "Picture-in-Picture enter failed", e);
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
        // ------------------------------------------------------------

        @JavascriptInterface
        public boolean prepareEngineData() {
            // The pinned Minecraft version of the bundled engine is 26.3
            // (research-lock.json); the installer expects engine-data-<mc>.zip.
            File dest = safeResolve(activity, "engine-data-26.3.zip");
            if (dest == null) return false;
            if (dest.isFile() && dest.length() > 0) return true;
            try (InputStream in = activity.getAssets().open("engine-data.zip");
                 FileOutputStream out = new FileOutputStream(dest)) {
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                out.flush();
                Log.i(TAG, "engine-data-26.3.zip staged: " + dest.length() + " bytes");
                return dest.length() > 0;
            } catch (Exception e) {
                Log.e(TAG, "prepareEngineData failed", e);
                return false;
            }
        }

        @JavascriptInterface
        public void launchGame(String username) {
            Log.i(TAG, "Starting NativeActivity with player: " + username);
            try {
                File dir = baseDir();
                if (dir != null) {
                    File playerFile = new File(dir, "horizon-player.txt");
                    FileWriter writer = new FileWriter(playerFile);
                    writer.write("name:" + username.trim() + "\n");
                    writer.close();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error writing player name", e);
            }

            // Asset-install runs (install-assets.flag present) show a plain
            // black engine window while the resources download from Mojang.
            // The engine needs its window created to get through startup, so
            // let it run in the foreground until it reports progress, then
            // bring the launcher WebView back on top: the user watches the
            // launcher progress bar instead of the black engine window.
            boolean installing = new File(baseDir(), "install-assets.flag").isFile();

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
