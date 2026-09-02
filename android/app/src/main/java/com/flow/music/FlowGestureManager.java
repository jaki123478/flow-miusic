package com.flow.music;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Vibrator;
import android.util.Log;

public class FlowGestureManager implements SensorEventListener {
    private static final String TAG = "FlowGestureManager";

    public interface GestureListener {
        void onShake();
        void onAirWave();
    }

    private final Context context;
    private final SensorManager sensorManager;
    private final Sensor accelerometer;
    private final Sensor proximitySensor;
    private final Vibrator vibrator;

    private GestureListener listener;
    private boolean shakeEnabled = true;
    private boolean airGesturesEnabled = true;

    private long lastShakeTime = 0;
    private long lastWaveTime = 0;
    private static final float SHAKE_THRESHOLD = 14.5f;

    public FlowGestureManager(Context context, GestureListener listener) {
        this.context = context.getApplicationContext();
        this.listener = listener;
        this.sensorManager = (SensorManager) this.context.getSystemService(Context.SENSOR_SERVICE);
        this.vibrator = (Vibrator) this.context.getSystemService(Context.VIBRATOR_SERVICE);

        this.accelerometer = sensorManager != null ? sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) : null;
        this.proximitySensor = sensorManager != null ? sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY) : null;
    }

    public void start() {
        if (sensorManager == null) return;
        if (accelerometer != null && shakeEnabled) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
        }
        if (proximitySensor != null && airGesturesEnabled) {
            sensorManager.registerListener(this, proximitySensor, SensorManager.SENSOR_DELAY_UI);
        }
    }

    public void stop() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    public void setShakeEnabled(boolean enabled) {
        this.shakeEnabled = enabled;
        if (sensorManager != null && accelerometer != null) {
            if (enabled) {
                sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
            } else {
                sensorManager.unregisterListener(this, accelerometer);
            }
        }
    }

    public void setAirGesturesEnabled(boolean enabled) {
        this.airGesturesEnabled = enabled;
        if (sensorManager != null && proximitySensor != null) {
            if (enabled) {
                sensorManager.registerListener(this, proximitySensor, SensorManager.SENSOR_DELAY_UI);
            } else {
                sensorManager.unregisterListener(this, proximitySensor);
            }
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        long now = System.currentTimeMillis();

        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER && shakeEnabled) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];

            float gX = x / SensorManager.GRAVITY_EARTH;
            float gY = y / SensorManager.GRAVITY_EARTH;
            float gZ = z / SensorManager.GRAVITY_EARTH;

            float gForce = (float) Math.sqrt(gX * gX + gY * gY + gZ * gZ);

            if (gForce > 2.7f && (now - lastShakeTime > 1500)) {
                lastShakeTime = now;
                vibrateFeedback(60);
                if (listener != null) {
                    listener.onShake();
                }
            }
        } else if (event.sensor.getType() == Sensor.TYPE_PROXIMITY && airGesturesEnabled) {
            float distance = event.values[0];
            float max = proximitySensor != null ? proximitySensor.getMaximumRange() : 5f;

            if (distance < max && (now - lastWaveTime > 1200)) {
                lastWaveTime = now;
                vibrateFeedback(40);
                if (listener != null) {
                    listener.onAirWave();
                }
            }
        }
    }

    private void vibrateFeedback(long ms) {
        try {
            if (vibrator != null && vibrator.hasVibrator()) {
                vibrator.vibrate(ms);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
