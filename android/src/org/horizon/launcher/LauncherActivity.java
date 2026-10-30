package org.horizon.launcher;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.WindowManager;
import java.io.File;
import java.io.FileWriter;

public class LauncherActivity extends Activity {
    private static final String TAG = "LauncherActivity";
    private WebView webView;

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
        webView.addJavascriptInterface(new LauncherBridge(this), "AndroidLauncher");
        
        webView.setWebChromeClient(new CustomChromeClient());
        webView.setWebViewClient(new CustomWebClient());

        webView.loadUrl("file:///android_asset/launcher/index.html");
        setContentView(webView);
    }

    public static class CustomChromeClient extends WebChromeClient {
        @Override
        public boolean onConsoleMessage(ConsoleMessage cm) {
            Log.d("LauncherJS", cm.message() + " [" + cm.sourceId() + ":" + cm.lineNumber() + "]");
            return true;
        }
    }

    public static class CustomWebClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            Log.i(TAG, "WebView finished loading: " + url);
        }
    }

    public static class LauncherBridge {
        private Context context;

        public LauncherBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void launchGame(String username) {
            Log.i(TAG, "Starting NativeActivity with player: " + username);
            try {
                File dir = context.getExternalFilesDir(null);
                if (dir != null) {
                    File playerFile = new File(dir, "horizon-player.txt");
                    FileWriter writer = new FileWriter(playerFile);
                    writer.write("name:" + username.trim() + "\n");
                    writer.close();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error writing player name", e);
            }

            Intent intent = new Intent(context, android.app.NativeActivity.class);
            context.startActivity(intent);
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    v.vibrate(ms);
                }
            } catch (Exception ignored) {}
        }
    }
}
