from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.stt_service import stt_service

router = APIRouter()


@router.websocket("/ws/stt")
async def websocket_stt_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("STT WebSocket connection established.")

    async def on_text_detected(text):
        print(f"STT Detected: {text}")
        await websocket.send_text(text)

    # Create a new recorder instance for this connection
    recorder = stt_service.create_recorder(on_text_detected)

    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            recorder.feed_audio(audio_chunk)

    except WebSocketDisconnect:
        print("STT WebSocket connection closed.")
    except Exception as e:
        print(f"An error occurred in STT WebSocket: {e}")
    finally:
        recorder.stop()
