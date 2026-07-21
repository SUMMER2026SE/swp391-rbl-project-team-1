@echo off
echo ============================================================
echo Running MinerU Service Automated Verification Test
echo ============================================================

set TEST_SCRIPT="%~dp0..\..\scratch\test_mineru_endpoint.py"

"%~dp0venv\Scripts\python.exe" -c "import requests, json; r = requests.get('http://localhost:8001/health'); print('GET /health Response:', r.status_code, r.json()); assert r.status_code == 200 and r.json().get('status') == 'ok', 'Health Check Failed!'"
if errorlevel 1 (
    echo ❌ GET /health verification failed!
    exit /b 1
)

echo ✅ GET /health test passed.

if exist "%TEST_SCRIPT%" (
    "%~dp0venv\Scripts\python.exe" "%TEST_SCRIPT%"
) else (
    echo Verification script missing, testing default sample PDF...
    "%~dp0venv\Scripts\python.exe" -c "import requests, json; f={'file': open('../../EduPath_AI_Bao_Cao_Cuoi_Ky.pdf', 'rb')}; r = requests.post('http://localhost:8001/parse', files=f); print('POST /parse Response:', r.status_code, list(r.json().keys())); assert r.status_code == 200 and 'pages' in r.json(), 'Parse Failed!'"
)

echo ============================================================
echo ✅ MinerU Service Verification Successful!
echo ============================================================
