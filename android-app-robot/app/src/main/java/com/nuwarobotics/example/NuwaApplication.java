package com.nuwarobotics.example;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.nuwarobotics.service.IClientId;
import com.nuwarobotics.service.agent.NuwaRobotAPI;
import com.nuwarobotics.service.agent.RobotEventListener;

import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttToken;

public class NuwaApplication extends Application implements RobotEventListener {

    private static final String TAG = "NuwaApplication";
    private static Context mContext;

    private NuwaRobotAPI mRobotAPI;
    private boolean isNuwaApiReady = false;

    // MQTT 設定
    private static final String MQTT_BROKER_URL = "wss://broker.mqttgo.io:8084/mqtt";
    private static final String MQTT_CLIENT_ID = "nuwa_robot_app"; // 可以自訂
    private static final String MQTT_TOPIC = "nuwa/command";

    @Override
    public void onCreate() {
        super.onCreate();
        mContext = getApplicationContext();

        // 初始化 Nuwa Robot API
        IClientId clientId = new IClientId(this.getPackageName());
        mRobotAPI = new NuwaRobotAPI(this, clientId);
        mRobotAPI.registerRobotEventListener(this);
    }

    public static Context getContext() {
        return mContext;
    }

    private void connectToMqtt() {
        MqttManager.getInstance().connect(mContext, MQTT_BROKER_URL, MQTT_CLIENT_ID, MQTT_TOPIC, new IMqttActionListener() {
            @Override
            public void onSuccess(IMqttToken asyncActionToken) {
                Log.d(TAG, "MQTT 連線成功");
                // 連線成功後訂閱主題
                MqttManager.getInstance().subscribe();
            }

            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                Log.e(TAG, "MQTT 連線失敗: " + exception.getMessage());
                // 檢查 Nuwa API 是否就緒，然後播放語音
                if (isNuwaApiReady && mRobotAPI != null) {
                    mRobotAPI.startTTS("MQTT連線失敗，請嘗試手動連線");
                }
            }
        });
    }

    // RobotEventListener Callbacks
    @Override
    public void onWikiServiceStart() {
        Log.d(TAG, "Nuwa SDK Service Started.");
        isNuwaApiReady = true;
        // SDK 準備就緒後，開始連線 MQTT
        connectToMqtt();
    }

    @Override
    public void onWikiServiceStop() {
        Log.d(TAG, "Nuwa SDK Service Stopped.");
        isNuwaApiReady = false;
    }

    // 其他 RobotEventListener 方法 (保持空白即可)
    @Override
    public void onWikiServiceCrash() { }

    @Override
    public void onWikiServiceRecovery() { }

    @Override
    public void onStartOfMotionPlay(String s) { }

    @Override
    public void onPauseOfMotionPlay(String s) { }

    @Override
    public void onStopOfMotionPlay(String s) { }

    @Override
    public void onCompleteOfMotionPlay(String s) { }

    @Override
    public void onPlayBackOfMotionPlay(String s) { }

    @Override
    public void onErrorOfMotionPlay(int i) { }

    @Override
    public void onPrepareMotion(boolean b, String s, float v) { }

    @Override
    public void onCameraOfMotionPlay(String s) { }

    @Override
    public void onGetCameraPose(float v, float v1, float v2, float v3, float v4, float v5, float v6, float v7, float v8, float v9, float v10, float v11) { }

    @Override
    public void onTouchEvent(int i, int i1) { }

    @Override
    public void onPIREvent(int i) { }

    @Override
    public void onTap(int i) { }

    @Override
    public void onLongPress(int i) { }

    @Override
    public void onWindowSurfaceReady() { }

    @Override
    public void onWindowSurfaceDestroy() { }

    @Override
    public void onTouchEyes(int i, int i1) { }

    @Override
    public void onRawTouch(int i, int i1, int i2) { }

    @Override
    public void onFaceSpeaker(float v) { }

    @Override
    public void onActionEvent(int i, int i1) { }

    @Override
    public void onDropSensorEvent(int i) { }

    @Override
    public void onMotorErrorEvent(int i, int i1) { }
}
