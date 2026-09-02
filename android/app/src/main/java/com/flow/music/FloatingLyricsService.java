package com.flow.music;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;

public class FloatingLyricsService extends Service {
    private static final String TAG = "FloatingLyricsService";
    public static final String ACTION_UPDATE_LYRIC = "com.flow.music.action.UPDATE_LYRIC";
    public static final String EXTRA_TEXT = "extra_text";
    public static final String EXTRA_TITLE = "extra_title";

    private WindowManager windowManager;
    private View floatingView;
    private TextView lyricTextView;
    private TextView titleTextView;
    private WindowManager.LayoutParams params;

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            stopSelf();
            return;
        }

        try {
            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
            floatingView = LayoutInflater.from(this).inflate(R.layout.floating_lyrics_layout, null);

            lyricTextView = floatingView.findViewById(R.id.floating_lyric_text);
            titleTextView = floatingView.findViewById(R.id.floating_title);
            ImageView closeButton = floatingView.findViewById(R.id.floating_close);

            int layoutFlag;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
            } else {
                layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
            }

            params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    layoutFlag,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
            params.x = 0;
            params.y = 150;

            windowManager.addView(floatingView, params);

            closeButton.setOnClickListener(v -> stopSelf());

            // Drag to move overlay window
            floatingView.setOnTouchListener(new View.OnTouchListener() {
                private int initialX;
                private int initialY;
                private float initialTouchX;
                private float initialTouchY;

                @Override
                public boolean onTouch(View v, MotionEvent event) {
                    switch (event.getAction()) {
                        case MotionEvent.ACTION_DOWN:
                            initialX = params.x;
                            initialY = params.y;
                            initialTouchX = event.getRawX();
                            initialTouchY = event.getRawY();
                            return true;
                        case MotionEvent.ACTION_MOVE:
                            params.x = initialX + (int) (event.getRawX() - initialTouchX);
                            params.y = initialY + (int) (event.getRawY() - initialTouchY);
                            windowManager.updateViewLayout(floatingView, params);
                            return true;
                    }
                    return false;
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Failed to create floating overlay: " + e.getMessage());
            stopSelf();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_UPDATE_LYRIC.equals(intent.getAction())) {
            String text = intent.getStringExtra(EXTRA_TEXT);
            String title = intent.getStringExtra(EXTRA_TITLE);
            if (lyricTextView != null && text != null) {
                lyricTextView.setText(text);
            }
            if (titleTextView != null && title != null) {
                titleTextView.setText(title);
            }
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception ignored) {}
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
