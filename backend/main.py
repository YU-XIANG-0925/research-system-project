from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import shutil
import os
import uuid
import json
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Import custom modules
from pose_analyzer import analyze_video_from_path
from mqtt_client import mqtt_client
from llm_handler import get_tagged_script
from text_extractor import extract_text_from_upload # Import the new text extractor
from RealtimeSTT import AudioToTextRecorder

app = FastAPI()

# --- CORS Middleware Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] , # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"] , # Allows all methods
    allow_headers=["*"] , # Allows all headers
)

# --- App lifecycle events ---
@app.on_event("shutdown")
def shutdown_event():
    print("Application shutdown: Disconnecting MQTT client.")
    mqtt_client.disconnect()

# --- Create necessary directories ---
UPLOADS_DIR = "temp_uploads"
DATA_DIR = "analysis_data"
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# --- Pydantic Models ---
class MQTTSettings(BaseModel):
    broker_address: str
    port: int = 1883
    username: str | None = Field(default=None)
    password: str | None = Field(default=None)

# --- API Endpoints (Define before mounting static files) ---

# --- LLM Script Tagging Endpoint ---
@app.post("/scripts/auto-tag")
async def auto_tag_script(file: UploadFile = File(...)):
    """
    Receives a script file, extracts the text, sends it to the LLM for auto-tagging,
    and returns the structured JSON result.
    """
    if not file:
        return JSONResponse(status_code=400, content={"detail": "No file uploaded."})

    original_text = await extract_text_from_upload(file)

    # Check if the extractor returned an error message
    if "不支援的檔案格式" in original_text or "讀取檔案時發生錯誤" in original_text:
        return JSONResponse(status_code=400, content={"detail": original_text})

    if not original_text or not original_text.strip():
        return JSONResponse(status_code=400, content={"detail": "Uploaded file is empty or contains no text."})

    tagged_script_data = await get_tagged_script(original_text)

    if tagged_script_data is None:
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to get response from LLM or parse the result."}
        )
    
    return JSONResponse(content=tagged_script_data)

# --- Real-time Speech-to-Text WebSocket Endpoint ---
@app.websocket("/ws/stt")
async def websocket_stt_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("STT WebSocket connection established.")

    async def on_text_detected(text):
        print(f"STT Detected: {text}")
        await websocket.send_text(text)

    recorder = AudioToTextRecorder(
        model="base",
        language="zh",
        on_realtime_text=on_text_detected,
        use_microphone=False,
        spinner=False
    )

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

# --- MQTT Endpoints ---
@app.post("/settings/mqtt/connect")
def connect_mqtt_broker(settings: MQTTSettings):
    try:
        mqtt_client.connect(
            broker_address=settings.broker_address,
            port=settings.port,
            username=settings.username,
            password=settings.password
        )
        return JSONResponse(
            status_code=200,
            content={"message": f"Connection process to {settings.broker_address} initiated."}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Failed to initiate MQTT connection: {e}"}
        )

@app.get("/settings/mqtt/status")
def get_mqtt_status():
    return JSONResponse(content={
        "is_connected": mqtt_client.is_connected,
        "broker": mqtt_client.broker_address,
        "port": mqtt_client.port
    })

@app.post("/settings/mqtt/disconnect")
def disconnect_mqtt_broker():
    mqtt_client.disconnect()
    return JSONResponse(status_code=200, content={"message": "MQTT client disconnected."})


# --- Gesture Analysis Endpoint ---
@app.post("/gestures/upload-video")
async def upload_video_for_analysis(file: UploadFile = File(...)):
    unique_id = str(uuid.uuid4())
    temp_file_path = os.path.join(UPLOADS_DIR, f"{unique_id}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error saving file: {e}"})
    finally:
        file.file.close()

    analysis_result = analyze_video_from_path(temp_file_path)

    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)

    if analysis_result is None:
        return JSONResponse(status_code=500, content={"message": "Failed to analyze video."})

    output_filename = f"angles_{unique_id}.json"
    output_filepath = os.path.join(DATA_DIR, output_filename)
    
    try:
        with open(output_filepath, 'w', encoding='utf-8') as f:
            json.dump(analysis_result, f, indent=4)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error saving analysis data: {e}"})

    return JSONResponse(content={
        "message": "Video processed and data saved successfully",
        "original_filename": file.filename,
        "data_url": f"/data/{output_filename}"
    })

# --- Static file mounting (MUST BE LAST) ---
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")