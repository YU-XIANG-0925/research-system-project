package com.nuwarobotics.example;

import android.content.Context;
import android.util.Log;
import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;

public class MqttManager {

    private static final String TAG = "MqttManager";
    private static MqttManager instance;
    private MqttAndroidClient mqttClient;

    private MqttMessageListener listener;

    public interface MqttMessageListener {
        void onMessageArrived(String topic, MqttMessage message);
    }

    private MqttManager() {
        // Private constructor for singleton
    }

    public static synchronized MqttManager getInstance() {
        if (instance == null) {
            instance = new MqttManager();
        }
        return instance;
    }

    public void setListener(MqttMessageListener listener) {
        this.listener = listener;
    }

    public void removeListener() {
        this.listener = null;
    }

    public void connect(Context context, String serverUri, String clientId, IMqttActionListener listener) {
        if (mqttClient != null && mqttClient.isConnected()) {
            Log.d(TAG, "Already connected.");
            if (listener != null) {
                listener.onSuccess(null);
            }
            return;
        }

        mqttClient = new MqttAndroidClient(context.getApplicationContext(), serverUri, clientId);
        mqttClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                Log.d(TAG, "Connection lost");
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                Log.d(TAG, "Message arrived from topic: " + topic);
                if (MqttManager.this.listener != null) {
                    MqttManager.this.listener.onMessageArrived(topic, message);
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                Log.d(TAG, "Delivery complete");
            }
        });

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        try {
            mqttClient.connect(options, null, listener);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    public void subscribe(String topic, IMqttActionListener listener) {
        if (mqttClient != null && mqttClient.isConnected()) {
            try {
                mqttClient.subscribe(topic, 0, null, listener);
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }

    public void publish(String topic, String payload) {
        if (mqttClient != null && mqttClient.isConnected()) {
            try {
                MqttMessage message = new MqttMessage(payload.getBytes());
                mqttClient.publish(topic, message);
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }

    public void disconnect() {
        if (mqttClient != null && mqttClient.isConnected()) {
            try {
                mqttClient.disconnect();
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }

    public boolean isConnected() {
        return mqttClient != null && mqttClient.isConnected();
    }
}
