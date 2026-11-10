@echo off
echo Starting AirGuard AI Unified Web Application...
cd /d "%~dp0"
set PYTHONPATH=%~dp0backend
"C:\Users\RAHUL\AppData\Local\Python\bin\python.exe" start_server.py
pause
