@echo off
echo Starting MinerU Standalone Service on port 8001...
cd /d "%~dp0"
set MINERU_TOOLS_CONFIG_JSON=C:\Users\Admin\magic-pdf.json
"%~dp0venv\Scripts\python.exe" app.py
