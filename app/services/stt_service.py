from RealtimeSTT import AudioToTextRecorder


class STTService:
    def __init__(self):
        self.recorder = None

    def create_recorder(self, on_text_detected_callback):
        """Creates and returns a new AudioToTextRecorder instance."""
        return AudioToTextRecorder(
            model="base",
            language="zh",
            on_realtime_text=on_text_detected_callback,
            use_microphone=False,
            spinner=False,
        )


stt_service = STTService()
