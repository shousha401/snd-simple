$ErrorActionPreference = "Stop"

Write-Host "Starting SND Simple frontend..." -ForegroundColor Cyan
Write-Host "Frontend: http://127.0.0.1:3000" -ForegroundColor Cyan

Set-Location "C:\SND_Simple\app\frontend"

if (!(Test-Path ".\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm.cmd install
}

Write-Host "Launching Vite..." -ForegroundColor Green
npm.cmd run dev -- --host 127.0.0.1 --port 3000
