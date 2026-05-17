"""SND Simple — FastAPI Backend

A clean local legal assistant bridge:
React frontend → FastAPI backend → SND engine subprocess

No login. No auth. No JWT. No dashboard. No users.
"""

import os
import sys
import platform

# Ensure storage directories exist
from config import UPLOAD_DIR, AUDIO_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
import snd_engine

# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="SND Simple",
    description="Local legal research bridge — FastAPI backend",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ───────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Health check — verifies backend and engine paths."""
    return {
        "status": "ok",
        "app": "SND Simple",
        "backend": "FastAPI",
        "engine_root": config.ENGINE_ROOT,
        "engine_root_exists": os.path.isdir(config.ENGINE_ROOT),
        "engine_python": config.ENGINE_PYTHON,
        "engine_python_exists": os.path.isfile(config.ENGINE_PYTHON),
        "engine_code_dir_exists": os.path.isdir(config.ENGINE_CODE_DIR),
        "mode": "subprocess",
    }


@app.get("/api/engine-info")
def engine_info():
    """Return engine debug info — does NOT run the engine."""
    available_scripts = snd_engine.get_available_scripts()
    selected_script = snd_engine.select_script()

    # Build example command
    example_cmd = [
        config.ENGINE_PYTHON,
        selected_script if selected_script else os.path.join(config.ENGINE_CODE_DIR, "hybrid_search_v0.py"),
        "QUESTION_HERE",
        "--top-k",
        "8",
    ]

    return {
        "engine_root": config.ENGINE_ROOT,
        "engine_python": config.ENGINE_PYTHON,
        "engine_root_exists": os.path.isdir(config.ENGINE_ROOT),
        "engine_python_exists": os.path.isfile(config.ENGINE_PYTHON),
        "engine_code_dir": config.ENGINE_CODE_DIR,
        "engine_code_dir_exists": os.path.isdir(config.ENGINE_CODE_DIR),
        "selected_script": selected_script,
        "selected_script_exists": os.path.isfile(selected_script) if selected_script else False,
        "available_candidate_scripts": available_scripts,
        "example_command": example_cmd,
        "python_version": platform.python_version(),
    }


@app.post("/api/ask")
def ask(request: AskRequest):
    """Ask the SND engine a legal question. Returns raw engine output."""
    result = snd_engine.ask_engine(request.question)
    return {
        "ok": result["ok"],
        "question": request.question,
        "answer_text": result["answer_text"],
        "confidence": result["confidence"],
        "engine_debug": result["engine_debug"],
    }


@app.post("/api/upload-doc")
async def upload_doc(file: UploadFile = File(...)):
    """Upload a document — saves to storage/uploads only."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    # Sanitize filename
    safe_filename = os.path.basename(file.filename)
    save_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save file
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    return {
        "ok": True,
        "filename": safe_filename,
        "saved_path": save_path,
        "size_bytes": len(content),
    }


@app.post("/api/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio recording — saves to storage/audio only."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    # Ensure .webm extension
    safe_filename = os.path.basename(file.filename)
    if not safe_filename.endswith(".webm"):
        safe_filename += ".webm"

    save_path = os.path.join(AUDIO_DIR, safe_filename)

    # Save file
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    return {
        "ok": True,
        "filename": safe_filename,
        "saved_path": save_path,
        "size_bytes": len(content),
        "note": "Audio saved. Transcription can be added later.",
    }


# ── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.BACKEND_HOST,
        port=config.BACKEND_PORT,
        reload=True,
    )
