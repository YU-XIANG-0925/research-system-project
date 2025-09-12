
import paho.mqtt.client as mqtt
import json

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        self.is_connected = False
        self.broker_address = ""
        self.port = 1883
        self.username = ""
        self.password = ""

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Successfully connected to MQTT Broker!")
            self.is_connected = True
        else:
            print(f"Failed to connect, return code {rc}\n")
            self.is_connected = False

    def on_disconnect(self, client, userdata, rc):
        print(f"Disconnected from MQTT Broker with code: {rc}")
        self.is_connected = False

    def on_message(self, client, userdata, msg):
        print(f"Received message on topic {msg.topic}: {msg.payload.decode()}")
        # Here you can add logic to process incoming messages

    def connect(self, broker_address, port=1883, username="", password=""):
        if self.is_connected:
            print("Already connected. Disconnecting first.")
            self.disconnect()

        self.broker_address = broker_address
        self.port = port
        self.username = username
        self.password = password

        if self.username and self.password:
            self.client.username_pw_set(self.username, self.password)
        
        try:
            print(f"Connecting to {self.broker_address}:{self.port}...")
            self.client.connect(self.broker_address, self.port, 60)
            self.client.loop_start() # Start a background thread to handle network traffic
        except Exception as e:
            print(f"Error connecting to MQTT Broker: {e}")
            self.is_connected = False

    def disconnect(self):
        if self.is_connected:
            print("Disconnecting from MQTT Broker...")
            self.client.loop_stop() # Stop the background thread
            self.client.disconnect()
        else:
            print("Not connected, no need to disconnect.")

    def publish(self, topic, payload, qos=1):
        if self.is_connected:
            try:
                self.client.publish(topic, json.dumps(payload), qos)
                print(f"Published to {topic}: {payload}")
            except Exception as e:
                print(f"Failed to publish message: {e}")
        else:
            print("Cannot publish, not connected to MQTT Broker.")

    def subscribe(self, topic, qos=1):
        if self.is_connected:
            try:
                self.client.subscribe(topic, qos)
                print(f"Subscribed to topic: {topic}")
            except Exception as e:
                print(f"Failed to subscribe to topic: {e}")
        else:
            print("Cannot subscribe, not connected to MQTT Broker.")

# Create a singleton instance
mqtt_client = MQTTClient()
