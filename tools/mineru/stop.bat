@echo off
echo Stopping MinerU Service on port 8001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)
echo MinerU Service stopped.
