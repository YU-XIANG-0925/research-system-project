from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Import custom modules
from app.api import api_router
from app.services.mqtt_service import mqtt_service
from app.services.file_service import DATA_DIR

app = FastAPI()

# --- CORS Middleware Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# --- App lifecycle events ---
@app.on_event("shutdown")
def shutdown_event():
    print("Application shutdown: Disconnecting MQTT client.")
    mqtt_service.disconnect()


# --- Include API Router ---
app.include_router(api_router)

# --- Static file mounting (MUST BE LAST) ---
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

# Resolve absolute path to frontend directory
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

if not FRONTEND_DIR.exists():
    raise RuntimeError(f"Directory '{FRONTEND_DIR}' does not exist")

app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
