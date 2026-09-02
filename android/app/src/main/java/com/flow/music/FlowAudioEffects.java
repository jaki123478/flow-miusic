package com.flow.music;

import android.media.audiofx.BassBoost;
import android.media.audiofx.Equalizer;
import android.media.audiofx.PresetReverb;
import android.media.audiofx.Virtualizer;
import android.util.Log;

public class FlowAudioEffects {
    private static final String TAG = "FlowAudioEffects";
    private static FlowAudioEffects instance;

    private BassBoost bassBoost;
    private Virtualizer virtualizer;
    private Equalizer equalizer;
    private PresetReverb presetReverb;

    private int audioSessionId = 0;
    private boolean bassBoostEnabled = true;
    private short bassBoostStrength = 800; // 0 - 1000
    private boolean virtualizerEnabled = true;
    private short virtualizerStrength = 700; // 0 - 1000

    public static synchronized FlowAudioEffects getInstance() {
        if (instance == null) {
            instance = new FlowAudioEffects();
        }
        return instance;
    }

    public synchronized void init(int sessionId) {
        this.audioSessionId = sessionId;
        release();

        try {
            bassBoost = new BassBoost(0, sessionId);
            bassBoost.setEnabled(bassBoostEnabled);
            if (bassBoost.getStrengthSupported()) {
                bassBoost.setStrength(bassBoostStrength);
            }
        } catch (Exception e) {
            Log.w(TAG, "BassBoost init failed: " + e.getMessage());
        }

        try {
            virtualizer = new Virtualizer(0, sessionId);
            virtualizer.setEnabled(virtualizerEnabled);
            if (virtualizer.getStrengthSupported()) {
                virtualizer.setStrength(virtualizerStrength);
            }
        } catch (Exception e) {
            Log.w(TAG, "Virtualizer init failed: " + e.getMessage());
        }

        try {
            equalizer = new Equalizer(0, sessionId);
            equalizer.setEnabled(true);
        } catch (Exception e) {
            Log.w(TAG, "Equalizer init failed: " + e.getMessage());
        }
    }

    public synchronized void setBassBoost(boolean enabled, int strengthPercent) {
        this.bassBoostEnabled = enabled;
        this.bassBoostStrength = (short) Math.max(0, Math.min(1000, strengthPercent * 10));
        if (bassBoost != null) {
            try {
                bassBoost.setEnabled(enabled);
                if (enabled && bassBoost.getStrengthSupported()) {
                    bassBoost.setStrength(bassBoostStrength);
                }
            } catch (Exception e) {
                Log.w(TAG, "Set BassBoost error: " + e.getMessage());
            }
        }
    }

    public synchronized void setVirtualizer(boolean enabled, int strengthPercent) {
        this.virtualizerEnabled = enabled;
        this.virtualizerStrength = (short) Math.max(0, Math.min(1000, strengthPercent * 10));
        if (virtualizer != null) {
            try {
                virtualizer.setEnabled(enabled);
                if (enabled && virtualizer.getStrengthSupported()) {
                    virtualizer.setStrength(virtualizerStrength);
                }
            } catch (Exception e) {
                Log.w(TAG, "Set Virtualizer error: " + e.getMessage());
            }
        }
    }

    public synchronized void setEqualizerBand(int bandIndex, int gainLevel) {
        if (equalizer != null) {
            try {
                short min = equalizer.getBandLevelRange()[0];
                short max = equalizer.getBandLevelRange()[1];
                short level = (short) Math.max(min, Math.min(max, gainLevel));
                equalizer.setBandLevel((short) bandIndex, level);
            } catch (Exception e) {
                Log.w(TAG, "Set Equalizer band error: " + e.getMessage());
            }
        }
    }

    public synchronized void release() {
        try {
            if (bassBoost != null) {
                bassBoost.release();
                bassBoost = null;
            }
            if (virtualizer != null) {
                virtualizer.release();
                virtualizer = null;
            }
            if (equalizer != null) {
                equalizer.release();
                equalizer = null;
            }
            if (presetReverb != null) {
                presetReverb.release();
                presetReverb = null;
            }
        } catch (Exception e) {
            Log.w(TAG, "Release audio effects error: " + e.getMessage());
        }
    }
}
