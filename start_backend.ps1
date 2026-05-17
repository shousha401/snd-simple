$ErrorActionPreference = "Stop"

Write-Host "Starting SND Simple backend..." -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8010" -ForegroundColor Cyan
Write-Host "Engine:  C:\SND_Fresh" -ForegroundColor Cyan

Set-Location "C:\SND_Simple\app\backend"

if (!(Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Installing backend requirements..." -ForegroundColor Yellow
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Launching FastAPI..." -ForegroundColor Green
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8010 --reload
