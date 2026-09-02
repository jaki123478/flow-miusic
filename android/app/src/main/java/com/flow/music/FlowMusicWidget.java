package com.flow.music;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;

public class FlowMusicWidget extends AppWidgetProvider {
    public static final String ACTION_WIDGET_PLAY = "com.flow.music.widget.PLAY";
    public static final String ACTION_WIDGET_NEXT = "com.flow.music.widget.NEXT";
    public static final String ACTION_WIDGET_PREV = "com.flow.music.widget.PREV";

    private static String cachedTitle = "Flow Music";
    private static String cachedArtist = "In riproduzione";
    private static boolean cachedPlaying = false;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAllWidgets(Context context, String title, String artist, boolean isPlaying) {
        cachedTitle = (title != null && !title.isEmpty()) ? title : "Flow Music";
        cachedArtist = (artist != null && !artist.isEmpty()) ? artist : "In riproduzione";
        cachedPlaying = isPlaying;

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName componentName = new ComponentName(context, FlowMusicWidget.class);
        int[] ids = manager.getAppWidgetIds(componentName);

        for (int id : ids) {
            updateAppWidget(context, manager, id);
        }
    }

    private static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_flow_music);

        views.setTextViewText(R.id.widget_title, cachedTitle);
        views.setTextViewText(R.id.widget_artist, cachedArtist);
        views.setImageViewResource(R.id.widget_btn_play, cachedPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play);

        // Open App Intent
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        views.setOnClickPendingIntent(R.id.widget_container, getPendingIntent(context, 0, openIntent));

        // Play/Pause Intent
        Intent playIntent = new Intent(context, FlowMusicWidget.class).setAction(ACTION_WIDGET_PLAY);
        views.setOnClickPendingIntent(R.id.widget_btn_play, getBroadcastPendingIntent(context, 1, playIntent));

        // Next Intent
        Intent nextIntent = new Intent(context, FlowMusicWidget.class).setAction(ACTION_WIDGET_NEXT);
        views.setOnClickPendingIntent(R.id.widget_btn_next, getBroadcastPendingIntent(context, 2, nextIntent));

        // Prev Intent
        Intent prevIntent = new Intent(context, FlowMusicWidget.class).setAction(ACTION_WIDGET_PREV);
        views.setOnClickPendingIntent(R.id.widget_btn_prev, getBroadcastPendingIntent(context, 3, prevIntent));

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent getPendingIntent(Context context, int reqCode, Intent intent) {
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT;
        return PendingIntent.getActivity(context, reqCode, intent, flags);
    }

    private static PendingIntent getBroadcastPendingIntent(Context context, int reqCode, Intent intent) {
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT;
        return PendingIntent.getBroadcast(context, reqCode, intent, flags);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (action != null) {
            Intent serviceIntent = new Intent(context, MediaPlaybackService.class);
            if (ACTION_WIDGET_PLAY.equals(action)) {
                serviceIntent.setAction(MediaPlaybackService.ACTION_TOGGLE_PLAY);
                context.startService(serviceIntent);
            } else if (ACTION_WIDGET_NEXT.equals(action)) {
                serviceIntent.setAction(MediaPlaybackService.ACTION_NEXT);
                context.startService(serviceIntent);
            } else if (ACTION_WIDGET_PREV.equals(action)) {
                serviceIntent.setAction(MediaPlaybackService.ACTION_PREV);
                context.startService(serviceIntent);
            }
        }
    }
}
