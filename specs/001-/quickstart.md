# Quickstart for Speech Coaching System

## 1. Setup Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 2. Setup Frontend
Open `frontend/index.html` in your web browser.

## 3. Usage
1.  Upload a `.txt` script file.
2.  The script will be displayed with annotations.
3.  Click on annotations to edit them.
4.  Go to the "Present" tab to start the teleprompter.
5.  Allow microphone access for speech recognition.
6.  The teleprompter will scroll as you speak, and cues will be highlighted.