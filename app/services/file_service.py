import os
import shutil
import uuid
import json
from fastapi import UploadFile

UPLOADS_DIR = "temp_uploads"
DATA_DIR = "analysis_data"

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


async def extract_text_from_upload(file: UploadFile) -> str:
    """Extracts text content from a .txt file upload."""
    if not file.filename.lower().endswith(".txt"):
        return f"不支援的檔案格式: {file.filename}。請上傳 .txt 檔案。"

    try:
        contents = await file.read()
        text = contents.decode("utf-8")
        return text
    except Exception as e:
        return f"讀取檔案時發生錯誤: {str(e)}"


async def save_uploaded_video(file: UploadFile) -> str:
    """Saves an uploaded video file to the temp uploads directory and returns the path."""
    unique_id = str(uuid.uuid4())
    temp_file_path = os.path.join(UPLOADS_DIR, f"{unique_id}_{file.filename}")

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return temp_file_path
    except Exception as e:
        raise IOError(f"Error saving file: {e}")
    finally:
        file.file.close()


def save_analysis_result(data: dict, original_filename: str) -> str:
    """Saves analysis result to a JSON file and returns the relative URL."""
    unique_id = str(uuid.uuid4())
    output_filename = f"angles_{unique_id}.json"
    output_filepath = os.path.join(DATA_DIR, output_filename)

    try:
        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        return f"/data/{output_filename}"
    except Exception as e:
        raise IOError(f"Error saving analysis data: {e}")


def delete_file(file_path: str):
    """Deletes a file if it exists."""
    if os.path.exists(file_path):
        os.remove(file_path)
