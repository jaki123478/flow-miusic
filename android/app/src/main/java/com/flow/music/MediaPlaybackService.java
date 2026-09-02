package com.flow.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;
import androidx.media.app.NotificationCompat.MediaStyle;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MediaPlaybackService extends Service {
    private static final String TAG = "MediaPlaybackService";
    public static final String CHANNEL_ID = "flow_playback_channel";
    public static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_START = "com.flow.music.action.START";
    public static final String ACTION_STOP = "com.flow.music.action.STOP";
    public static final String ACTION_UPDATE = "com.flow.music.action.UPDATE";
    public static final String ACTION_TOGGLE_PLAY = "com.flow.music.action.TOGGLE_PLAY";
    public static final String ACTION_NEXT = "com.flow.music.action.NEXT";
    public static final String ACTION_PREV = "com.flow.music.action.PREV";

    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_ARTIST = "extra_artist";
    public static final String EXTRA_ARTWORK = "extra_artwork";
    public static final String EXTRA_IS_PLAYING = "extra_is_playing";
    public static final String EXTRA_POSITION = "extra_position";
    public static final String EXTRA_DURATION = "extra_duration";

    private PowerManager.WakeLock wakeLock;
    private MediaSessionCompat mediaSession;
    private String currentTitle = "Flow Music";
    private String currentArtist = "Riproduzione audio attiva";
    private String currentArtworkUrl = "";
    private Bitmap currentArtworkBitmap = null;
    private boolean currentPlaying = true;
    private long currentPosition = 0;
    private long currentDuration = 0;

    private static MediaPlaybackService instance;
    public static MediaPlaybackService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        createNotificationChannel();
        acquireWakeLock();
        initMediaSession();
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null && wakeLock == null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Flow::MediaWakeLock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(12 * 60 * 60 * 1000L);
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

    private void initMediaSession() {
        mediaSession = new MediaSessionCompat(this, "FlowMediaSession");
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                MainActivity.dispatchWebAction("play");
            }

            @Override
            public void onPause() {
                MainActivity.dispatchWebAction("pause");
            }

            @Override
            public void onSkipToNext() {
                MainActivity.dispatchWebAction("next");
            }

            @Override
            public void onSkipToPrevious() {
                MainActivity.dispatchWebAction("prev");
            }

            @Override
            public void onSeekTo(long pos) {
                MainActivity.dispatchWebSeek(pos);
            }
        });
        mediaSession.setActive(true);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            } else if (ACTION_TOGGLE_PLAY.equals(action)) {
                MainActivity.dispatchWebAction("toggle");
            } else if (ACTION_NEXT.equals(action)) {
                MainActivity.dispatchWebAction("next");
            } else if (ACTION_PREV.equals(action)) {
                MainActivity.dispatchWebAction("prev");
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
            if (intent.hasExtra(EXTRA_POSITION)) {
                currentPosition = intent.getLongExtra(EXTRA_POSITION, 0);
            }
            if (intent.hasExtra(EXTRA_DURATION)) {
                currentDuration = intent.getLongExtra(EXTRA_DURATION, 0);
            }
            if (intent.hasExtra(EXTRA_ARTWORK)) {
                String art = intent.getStringExtra(EXTRA_ARTWORK);
                if (art != null && !art.equals(currentArtworkUrl)) {
                    currentArtworkUrl = art;
                    fetchArtworkAsync(art);
                }
            }
        }

        updateMediaSessionState();
        Notification notification = buildMediaStyleNotification();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            Log.e(TAG, "startForeground error: " + e.getMessage(), e);
        }

        // Update home screen widgets
        FlowMusicWidget.updateAllWidgets(this, currentTitle, currentArtist, currentPlaying);

        return START_STICKY;
    }

    private void updateMediaSessionState() {
        if (mediaSession == null) return;

        int state = currentPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        long actions = PlaybackStateCompat.ACTION_PLAY
                | PlaybackStateCompat.ACTION_PAUSE
                | PlaybackStateCompat.ACTION_PLAY_PAUSE
                | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
                | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
                | PlaybackStateCompat.ACTION_SEEK_TO;

        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(state, currentPosition * 1000, 1.0f);

        mediaSession.setPlaybackState(stateBuilder.build());

        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, currentDuration * 1000);

        if (currentArtworkBitmap != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, currentArtworkBitmap);
        }

        mediaSession.setMetadata(metaBuilder.build());
    }

    private void fetchArtworkAsync(String urlStr) {
        new Thread(() -> {
            try {
                URL url = new URL(urlStr);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(6000);
                conn.setReadTimeout(6000);
                conn.connect();
                InputStream input = conn.getInputStream();
                Bitmap bitmap = BitmapFactory.decodeStream(input);
                if (bitmap != null) {
                    currentArtworkBitmap = bitmap;
                    new Handler(Looper.getMainLooper()).post(() -> {
                        updateMediaSessionState();
                        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                        if (manager != null) {
                            manager.notify(NOTIFICATION_ID, buildMediaStyleNotification());
                        }
                    });
                }
            } catch (Exception ignored) {}
        }).start();
    }

    private Notification buildMediaStyleNotification() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int pendingFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
                : PendingIntent.FLAG_UPDATE_CURRENT;
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openAppIntent, pendingFlags);

        Intent prevIntent = new Intent(this, MediaPlaybackService.class).setAction(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getService(this, 1, prevIntent, pendingFlags);

        Intent toggleIntent = new Intent(this, MediaPlaybackService.class).setAction(ACTION_TOGGLE_PLAY);
        PendingIntent pToggle = PendingIntent.getService(this, 2, toggleIntent, pendingFlags);

        Intent nextIntent = new Intent(this, MediaPlaybackService.class).setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(this, 3, nextIntent, pendingFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(currentPlaying)
                .setSilent(true)
                .setShowWhen(false)
                .addAction(android.R.drawable.ic_media_previous, "Precedente", pPrev)
                .addAction(currentPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, "Play/Pausa", pToggle)
                .addAction(android.R.drawable.ic_media_next, "Successivo", pNext)
                .setStyle(new MediaStyle()
                        .setMediaSession(mediaSession != null ? mediaSession.getSessionToken() : null)
                        .setShowActionsInCompactView(0, 1, 2));

        if (currentArtworkBitmap != null) {
            builder.setLargeIcon(currentArtworkBitmap);
        }

        return builder.build();
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        instance = null;
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
            channel.setDescription("Controlli multimediali e riproduzione a schermo spento");
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
