$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
$env:PYTHONPATH = Join-Path $scriptDir "backend"
Write-Host "Starting AirGuard AI Application on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
& "C:\Users\RAHUL\AppData\Local\Python\bin\python.exe" start_server.py
