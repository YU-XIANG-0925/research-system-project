import tempfile
import os
from fastapi import UploadFile

async def extract_text_from_upload(file: UploadFile) -> str:
    """Extracts text content from a .txt file upload."""
    # This function is simplified to only handle .txt files for now.
    if not file.filename.lower().endswith(".txt"):
        return f"不支援的檔案格式: {file.filename}。請上傳 .txt 檔案。"

    try:
        # Asynchronously read the content of the uploaded file
        contents = await file.read()
        # Decode assuming UTF-8 encoding
        text = contents.decode('utf-8')
        return text
    except Exception as e:
        return f"讀取檔案時發生錯誤: {str(e)}"