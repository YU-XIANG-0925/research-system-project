from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.mqtt_service import mqtt_service
from app.services.llm_service import get_tagged_script
from app.services.file_service import (
    extract_text_from_upload,
    save_uploaded_video,
    save_analysis_result,
    delete_file,
)
from app.services.pose_service import analyze_video_from_path

router = APIRouter()


# --- Pydantic Models ---
class MQTTSettings(BaseModel):
    broker_address: str
    port: int = 1883
    username: str | None = Field(default=None)
    password: str | None = Field(default=None)


# --- LLM Script Tagging Endpoint ---
@router.post("/scripts/auto-tag")
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
        return JSONResponse(
            status_code=400,
            content={"detail": "Uploaded file is empty or contains no text."},
        )

    tagged_script_data = await get_tagged_script(original_text)

    if tagged_script_data is None:
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to get response from LLM or parse the result."},
        )

    return JSONResponse(content=tagged_script_data)


# --- MQTT Endpoints ---
@router.post("/settings/mqtt/connect")
def connect_mqtt_broker(settings: MQTTSettings):
    try:
        mqtt_service.connect(
            broker_address=settings.broker_address,
            port=settings.port,
            username=settings.username,
            password=settings.password,
        )
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Connection process to {settings.broker_address} initiated."
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Failed to initiate MQTT connection: {e}"},
        )


@router.get("/settings/mqtt/status")
def get_mqtt_status():
    return JSONResponse(
        content={
            "is_connected": mqtt_service.is_connected,
            "broker": mqtt_service.broker_address,
            "port": mqtt_service.port,
        }
    )


@router.post("/settings/mqtt/disconnect")
def disconnect_mqtt_broker():
    mqtt_service.disconnect()
    return JSONResponse(
        status_code=200, content={"message": "MQTT client disconnected."}
    )


# --- Gesture Analysis Endpoint ---
@router.post("/gestures/upload-video")
async def upload_video_for_analysis(file: UploadFile = File(...)):
    try:
        temp_file_path = await save_uploaded_video(file)
    except IOError as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

    analysis_result = analyze_video_from_path(temp_file_path)

    delete_file(temp_file_path)

    if analysis_result is None:
        return JSONResponse(
            status_code=500, content={"message": "Failed to analyze video."}
        )

    try:
        data_url = save_analysis_result(analysis_result, file.filename)
    except IOError as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

    return JSONResponse(
        content={
            "message": "Video processed and data saved successfully",
            "original_filename": file.filename,
            "data_url": data_url,
        }
    )
