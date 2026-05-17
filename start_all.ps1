$ErrorActionPreference = "Stop"

Write-Host "Starting SND Simple..." -ForegroundColor Cyan
Write-Host "Backend:  http://127.0.0.1:8010" -ForegroundColor Cyan
Write-Host "Frontend: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "Engine:   C:\SND_Fresh" -ForegroundColor Cyan

Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "C:\SND_Simple\start_backend.ps1"
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "C:\SND_Simple\start_frontend.ps1"
