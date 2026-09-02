package com.flow.music;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity implements FlowGestureManager.GestureListener {
    private static final String TAG = "FlowMainActivity";
    private static final String APP_URL = "https://flow-music-app-two.vercel.app/";
    private static final int NOTIFICATION_PERMISSION_CODE = 101;
    private static final int RECORD_AUDIO_PERMISSION_CODE = 102;
    private static final int OVERLAY_PERMISSION_CODE = 103;

    private static MainActivity instance;
    private WebView webView;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private BroadcastReceiver noisyAudioReceiver;
    private FlowGestureManager gestureManager;

    public static MainActivity getInstance() {
        return instance;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        initAudioSystem();
        initWebView();
        requestPermissions();
        startMediaService();

        gestureManager = new FlowGestureManager(this, this);
        gestureManager.start();

        FlowAudioEffects.getInstance().init(0);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    moveTaskToBack(true);
                }
            }
        });

        if (savedInstanceState == null) {
            if (webView != null) webView.loadUrl(APP_URL);
        } else {
            if (webView != null) webView.restoreState(savedInstanceState);
        }
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_CODE);
            }
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, RECORD_AUDIO_PERMISSION_CODE);
        }
    }

    private void startMediaService() {
        try {
            Intent serviceIntent = new Intent(this, MediaPlaybackService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to start MediaPlaybackService: " + e.getMessage());
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void initWebView() {
        webView = new WebView(this);
        setContentView(webView);

        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        webView.addJavascriptInterface(new FlowNativeBridge(), "FlowNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (webView != null) {
                    ((ViewGroup) webView.getParent()).removeView(webView);
                    webView.destroy();
                    webView = null;
                }
                initWebView();
                if (webView != null) webView.loadUrl(APP_URL);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
    }

    private void initAudioSystem() {
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        requestAudioFocus();

        noisyAudioReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                    dispatchWebAction("pause");
                }
            }
        };
        registerReceiver(noisyAudioReceiver, new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY));
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes attributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();

                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                        .setAudioAttributes(attributes)
                        .setAcceptsDelayedFocusGain(true)
                        .setOnAudioFocusChangeListener(focusChange -> {
                            if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
                                dispatchWebAction("pause");
                            }
                        })
                        .build();

                audioManager.requestAudioFocus(audioFocusRequest);
            } else {
                audioManager.requestAudioFocus(focusChange -> {
                    if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
                        dispatchWebAction("pause");
                    }
                }, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
            }
        } catch (Exception ignored) {}
    }

    public static void dispatchWebAction(String action) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (instance != null && instance.webView != null) {
                instance.webView.evaluateJavascript(
                        "window.__FLOW_DISPATCH_ACTION__ && window.__FLOW_DISPATCH_ACTION__('" + action + "');",
                        null
                );
            }
        });
    }

    public static void dispatchWebSeek(long positionSecs) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (instance != null && instance.webView != null) {
                instance.webView.evaluateJavascript(
                        "window.__FLOW_DISPATCH_SEEK__ && window.__FLOW_DISPATCH_SEEK__(" + positionSecs + ");",
                        null
                );
            }
        });
    }

    @Override
    public void onShake() {
        dispatchWebAction("next");
        showToast("📳 Shake to Skip: Brano successivo!");
    }

    @Override
    public void onAirWave() {
        dispatchWebAction("toggle");
        showToast("👋 Air Gesture: Play / Pausa");
    }

    private void showToast(String msg) {
        new Handler(Looper.getMainLooper()).post(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
    }

    @Override
    protected void onDestroy() {
        if (noisyAudioReceiver != null) {
            try {
                unregisterReceiver(noisyAudioReceiver);
            } catch (Exception ignored) {}
        }
        if (gestureManager != null) {
            gestureManager.stop();
        }
        FlowAudioEffects.getInstance().release();
        super.onDestroy();
    }

    public class FlowNativeBridge {
        @JavascriptInterface
        public void updateTrack(String title, String artist, String artwork, boolean isPlaying, long pos, long dur) {
            Intent intent = new Intent(MainActivity.this, MediaPlaybackService.class);
            intent.putExtra(MediaPlaybackService.EXTRA_TITLE, title);
            intent.putExtra(MediaPlaybackService.EXTRA_ARTIST, artist);
            intent.putExtra(MediaPlaybackService.EXTRA_ARTWORK, artwork);
            intent.putExtra(MediaPlaybackService.EXTRA_IS_PLAYING, isPlaying);
            intent.putExtra(MediaPlaybackService.EXTRA_POSITION, pos);
            intent.putExtra(MediaPlaybackService.EXTRA_DURATION, dur);
            startService(intent);
        }

        @JavascriptInterface
        public void updateFloatingLyric(String lyricText, String songTitle) {
            Intent intent = new Intent(MainActivity.this, FloatingLyricsService.class);
            intent.setAction(FloatingLyricsService.ACTION_UPDATE_LYRIC);
            intent.putExtra(FloatingLyricsService.EXTRA_TEXT, lyricText);
            intent.putExtra(FloatingLyricsService.EXTRA_TITLE, songTitle);
            startService(intent);
        }

        @JavascriptInterface
        public void toggleFloatingLyrics(boolean enable) {
            if (enable) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(MainActivity.this)) {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                    startActivityForResult(intent, OVERLAY_PERMISSION_CODE);
                } else {
                    startService(new Intent(MainActivity.this, FloatingLyricsService.class));
                    showToast("💬 Testi flottanti attivati");
                }
            } else {
                stopService(new Intent(MainActivity.this, FloatingLyricsService.class));
                showToast("💬 Testi flottanti disattivati");
            }
        }

        @JavascriptInterface
        public void setHardwareBassBoost(boolean enable, int percent) {
            FlowAudioEffects.getInstance().setBassBoost(enable, percent);
            if (enable) showToast("🎛️ Hardware Bass Boost: " + percent + "%");
        }

        @JavascriptInterface
        public void setHardwareVirtualizer(boolean enable, int percent) {
            FlowAudioEffects.getInstance().setVirtualizer(enable, percent);
            if (enable) showToast("🎧 Audio 3D Surround: " + percent + "%");
        }

        @JavascriptInterface
        public void setShakeToSkipEnabled(boolean enable) {
            if (gestureManager != null) gestureManager.setShakeEnabled(enable);
            showToast(enable ? "📳 Shake to Skip: Attivo" : "📳 Shake to Skip: Disattivato");
        }

        @JavascriptInterface
        public void setAirGesturesEnabled(boolean enable) {
            if (gestureManager != null) gestureManager.setAirGesturesEnabled(enable);
            showToast(enable ? "👋 Gesti a mezz'aria: Attivi" : "👋 Gesti a mezz'aria: Disattivati");
        }

        @JavascriptInterface
        public void downloadToMusicFolder(String title, String artist, String urlStr, String ext) {
            try {
                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm == null) return;

                String safeName = (artist + " - " + title).replaceAll("[\\\\/:*?\"<>|]", "_") + "." + (ext != null ? ext : "m4a");
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(urlStr));
                request.setTitle(title);
                request.setDescription(artist + " • Flow Music");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_MUSIC, "Flow/" + safeName);
                request.allowScanningByMediaScanner();

                dm.enqueue(request);
                showToast("💾 Salvataggio in Musica/Flow avviato: " + safeName);
            } catch (Exception e) {
                showToast("Errore download file: " + e.getMessage());
            }
        }
    }
}
