package com.flow.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

public class MediaPlaybackService extends Service {
    private static final String TAG = "MediaPlaybackService";
    public static final String CHANNEL_ID = "flow_playback_channel";
    public static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_START = "com.flow.music.action.START";
    public static final String ACTION_STOP = "com.flow.music.action.STOP";
    public static final String ACTION_UPDATE = "com.flow.music.action.UPDATE";
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_ARTIST = "extra_artist";
    public static final String EXTRA_IS_PLAYING = "extra_is_playing";

    private PowerManager.WakeLock wakeLock;
    private String currentTitle = "Flow Music";
    private String currentArtist = "Riproduzione audio attiva";
    private boolean currentPlaying = true;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        acquireWakeLock();
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null && wakeLock == null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Flow::MediaWakeLock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12h timeout
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to acquire wake lock: " + e.getMessage());
        }
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to release wake lock: " + e.getMessage());
        } finally {
            wakeLock = null;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }

            if (intent.hasExtra(EXTRA_TITLE)) {
                String t = intent.getStringExtra(EXTRA_TITLE);
                if (t != null && !t.trim().isEmpty()) currentTitle = t;
            }
            if (intent.hasExtra(EXTRA_ARTIST)) {
                String a = intent.getStringExtra(EXTRA_ARTIST);
                if (a != null && !a.trim().isEmpty()) currentArtist = a;
            }
            if (intent.hasExtra(EXTRA_IS_PLAYING)) {
                currentPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true);
            }
        }

        Notification notification = buildNotification(currentTitle, currentArtist, currentPlaying);

        try {
            // Android 14+ (API 34+) and Android 15/16/17 require explicit FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                        this,
                        NOTIFICATION_ID,
                        notification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                );
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            Log.e(TAG, "startForeground error: " + e.getMessage(), e);
        }

        return START_STICKY;
    }

    private Notification buildNotification(String title, String artist, boolean isPlaying) {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
                : PendingIntent.FLAG_UPDATE_CURRENT;
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, openAppIntent, pendingFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(artist)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(isPlaying)
                .setSilent(true)
                .setShowWhen(false);

        return builder.build();
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Riproduzione Flow",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Mantiene l'audio attivo a schermo spento e in background");
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}