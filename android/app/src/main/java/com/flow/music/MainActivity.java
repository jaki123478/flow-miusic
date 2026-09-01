package com.flow.music;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "FlowMainActivity";
    private static final String APP_URL = "https://orchid-spruce-topaz-sand.grok.me/";
    private static final int NOTIFICATION_PERMISSION_CODE = 101;

    private WebView webView;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private BroadcastReceiver noisyAudioReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 15/16/17 edge-to-edge configuration
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        initAudioSystem();
        initWebView();

        // Request POST_NOTIFICATIONS permission on Android 13+ (API 33+)
        requestNotificationPermission();

        // Start background media playback service safely
        startMediaService();

        // Back button navigation using OnBackPressedDispatcher
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

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        NOTIFICATION_PERMISSION_CODE
                );
            }
        }
    }

    private void startMediaService() {
        try {
            Intent serviceIntent = new Intent(this, MediaPlaybackService.class);
            serviceIntent.setAction(MediaPlaybackService.ACTION_START);
            ContextCompat.startForegroundService(this, serviceIntent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start MediaPlaybackService: " + e.getMessage());
        }
    }

    private void initAudioSystem() {
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();

                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                        .setAudioAttributes(audioAttributes)
                        .setAcceptsDelayedFocusGain(true)
                        .setOnAudioFocusChangeListener(focusChange -> {
                            if (focusChange == AudioManager.AUDIOFOCUS_LOSS
                                    || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                                executeJs("window.__flowAudioPause && window.__flowAudioPause();");
                            } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                                executeJs("window.__flowAudioResume && window.__flowAudioResume();");
                            }
                        })
                        .build();

                audioManager.requestAudioFocus(audioFocusRequest);
            } else {
                audioManager.requestAudioFocus(
                        focusChange -> {
                            if (focusChange == AudioManager.AUDIOFOCUS_LOSS
                                    || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                                executeJs("window.__flowAudioPause && window.__flowAudioPause();");
                            } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                                executeJs("window.__flowAudioResume && window.__flowAudioResume();");
                            }
                        },
                        AudioManager.STREAM_MUSIC,
                        AudioManager.AUDIOFOCUS_GAIN
                );
            }
        }

        // Handle headphone unplug / bluetooth disconnect (Audio becoming noisy)
        noisyAudioReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                    executeJs("window.__flowAudioPause && window.__flowAudioPause();");
                }
            }
        };
        try {
            registerReceiver(noisyAudioReceiver, new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY));
        } catch (Exception e) {
            Log.w(TAG, "Failed to register noisy audio receiver: " + e.getMessage());
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void initWebView() {
        try {
            if (webView == null) {
                webView = new WebView(this);
            }
            setContentView(webView);

            ViewCompat.setOnApplyWindowInsetsListener(webView, (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                v.setPadding(0, 0, 0, 0);
                return insets;
            });

            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                cookieManager.setAcceptThirdPartyCookies(webView, true);
            }

            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setUserAgentString(settings.getUserAgentString() + " FlowMusicAndroid/1.0.0 (Android; " + Build.VERSION.RELEASE + ")");

            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            webView.setBackgroundColor(0xFF000000);

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return false;
                }

                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (request.isForMainFrame()) {
                        Log.w(TAG, "Main frame web error: " + error.getDescription());
                    }
                }

                // Prevents fatal native crash when WebView render process runs out of memory or GPU dies
                @Override
                public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                    Log.e(TAG, "WebView render process crashed! Recovering cleanly...");
                    if (webView != null) {
                        ViewGroup parent = (ViewGroup) webView.getParent();
                        if (parent != null) {
                            parent.removeView(webView);
                        }
                        try {
                            webView.destroy();
                        } catch (Exception ignored) {}
                        webView = null;
                    }
                    initWebView();
                    if (webView != null) {
                        webView.loadUrl(APP_URL);
                    }
                    return true;
                }
            });

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            request.grant(request.getResources());
                        }
                    });
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Error initializing WebView: " + e.getMessage(), e);
        }
    }

    private void executeJs(String script) {
        if (webView != null) {
            runOnUiThread(() -> {
                try {
                    webView.evaluateJavascript(script, null);
                } catch (Exception ignored) {}
            });
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Do NOT pause WebView timer threads to keep background audio playing seamlessly!
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (noisyAudioReceiver != null) {
            try {
                unregisterReceiver(noisyAudioReceiver);
            } catch (Exception ignored) {}
            noisyAudioReceiver = null;
        }

        if (isFinishing()) {
            try {
                Intent serviceIntent = new Intent(this, MediaPlaybackService.class);
                serviceIntent.setAction(MediaPlaybackService.ACTION_STOP);
                stopService(serviceIntent);
            } catch (Exception ignored) {}
        }

        if (webView != null) {
            try {
                webView.destroy();
            } catch (Exception ignored) {}
            webView = null;
        }
    }
}