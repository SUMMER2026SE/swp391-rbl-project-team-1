@echo off
title EduPath MinerU Microservice Launcher
cd /d "%~dp0"

echo ===================================================
echo   EduPath AI - MinerU Microservice Auto Launcher
echo ===================================================

set "VENV_DIR=%~dp0..\..\mineru-env"

if not exist "%VENV_DIR%\pyvenv.cfg" (
    echo [1/3] Virtual environment not found or incomplete. Creating mineru-env...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtualenv. Please ensure Python 3.10+ is installed on your system PATH.
        pause
        exit /b 1
    )
)

echo [2/3] Checking and installing required Python packages...
"%VENV_DIR%\Scripts\python.exe" -m pip install -r requirements.txt

echo [3/3] Starting MinerU Service on http://localhost:8001 ...
"%VENV_DIR%\Scripts\python.exe" app.py
pause
