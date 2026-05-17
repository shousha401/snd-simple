# SND Simple

A very simple local legal assistant app.

React frontend → FastAPI backend → SND engine subprocess

The backend runs the engine at `C:\SND_Fresh` directly. No copy is made.

---

## What This App Does

- **Health Check** — Verifies backend is running and engine paths are correct
- **Ask SND** — Sends legal questions to the SND search engine via subprocess and returns raw ranked output
- **Upload Document** — Saves documents to `storage/uploads/` (processing can be added later)
- **Record Audio** — Records audio via browser MediaRecorder and saves to `storage/audio/` (transcription can be added later)

## What It Does NOT Do Yet

- No login or authentication
- No user management or JWT
- No dashboard or routing complexity
- No document processing (saves only)
- No audio transcription (saves only)
- No confidence scoring from engine output
- No local LLM or Ollama integration

---

## Requirements

- `C:\SND_Fresh` must exist with a working `.venv` and `04_code\hybrid_search_v0.py`
- Python 3.12+ (for backend)
- Node.js 20+ (for frontend)

---

## Project Structure

```
C:\SND_Simple
│
├── app
│   ├── backend           # FastAPI backend
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── snd_engine.py
│   │   ├── requirements.txt
│   │   └── storage
│   │       ├── uploads
│   │       └── audio
│   └── frontend          # React + Vite frontend
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── src
│           ├── main.jsx
│           ├── App.jsx
│           └── styles.css
│
├── start_backend.ps1
├── start_frontend.ps1
├── start_all.ps1
└── README.md
```

---

## How to Start

### Option 1: Start Both (Recommended)

```powershell
cd C:\SND_Simple
.\start_all.ps1
```

This will:
1. Start the backend on http://127.0.0.1:8010
2. Start the frontend on http://127.0.0.1:3000

### Option 2: Start Backend Only

```powershell
cd C:\SND_Simple
.\start_backend.ps1
```

Or manually:

```powershell
cd C:\SND_Simple\app\backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8010 --reload
```

### Option 3: Start Frontend Only

```powershell
cd C:\SND_Simple
.\start_frontend.ps1
```

Or manually:

```powershell
cd C:\SND_Simple\app\frontend
npm install
npm.cmd run dev -- --host 127.0.0.1 --port 3000
```

---

## How to Test

### Test 1: Health Check

```powershell
Invoke-RestMethod http://127.0.0.1:8010/health
```

Expected: `status = ok`, `engine_root` points to `C:\SND_Fresh`

### Test 2: Engine Info

```powershell
Invoke-RestMethod http://127.0.0.1:8010/api/engine-info
```

Expected: `selected_script` should be `hybrid_search_v0.py` if it exists under `C:\SND_Fresh\04_code`

### Test 3: Ask SND

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8010/api/ask" `
  -ContentType "application/json" `
  -Body '{"question":"ما موقف القانون من وكيل أجر شقة لمدة عشر سنوات؟"}'
```

Expected:
- `ok = true`
- `confidence = UNKNOWN`
- `answer_text` contains raw ranked output from the engine
- Should include article 559 content if the engine is working

**Note:** v1 returns raw engine stdout. The output is NOT summarized or parsed.

### Test 4: Upload Document

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8010/api/upload-doc" `
  -Form @{ file = Get-Item -Path "C:\path\to\your\document.pdf" }
```

Expected: `ok = true`, file saved to `C:\SND_Simple\app\backend\storage\uploads\`

---

## Engine Output Format

The SND engine returns raw text output like:

```
R01 final=...
PATH: ...
TEXT: ...
```

This is passed through as-is. The app does NOT:
- Parse the output
- Extract confidence scores
- Summarize results
- Clean or modify the text

If the subprocess fails, `confidence` will be `RED` and `stderr` will be shown in `engine_debug`.

---

## Ports

| Service  | Port | URL                     |
|----------|------|-------------------------|
| Backend  | 8010 | http://127.0.0.1:8010  |
| Frontend | 3000 | http://127.0.0.1:3000  |

---

## Notes

- **No login required.** Open the frontend and use all features immediately.
- **Arabic text is fully supported** in questions.
- **Documents and audio are saved only**, not processed yet.
- **Engine stderr is always visible** in the debug panel.
- **No old CaseDesk code** is used anywhere in this project.
- **The engine stays at `C:\SND_Fresh`.** Nothing is copied.
