"""SND Simple Backend Configuration"""

import os

# Engine paths — uses C:\SND_Fresh directly (no copy)
ENGINE_ROOT = r"C:\SND_Fresh"
ENGINE_PYTHON = r"C:\SND_Fresh\.venv\Scripts\python.exe"
ENGINE_CODE_DIR = r"C:\SND_Fresh\04_code"

# Storage paths
BACKEND_STORAGE = r"C:\SND_Simple\app\backend\storage"
UPLOAD_DIR = r"C:\SND_Simple\app\backend\storage\uploads"
AUDIO_DIR = r"C:\SND_Simple\app\backend\storage\audio"

# Server config
BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8010

# Candidate engine scripts in priority order
CANDIDATE_SCRIPTS = [
    "hybrid_search_v0.py",
    "source_pack_builder_v1.py",
    "search_bm25_ranked.py",
]
