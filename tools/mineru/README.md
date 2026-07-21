# MinerU Standalone Service

Autonomous, high-precision document parsing REST microservice wrapping MinerU, PyMuPDF, and python-docx.

## Overview
- **Service Port**: `8001`
- **Health Endpoint**: `GET /health` -> `{"status":"ok"}`
- **Parse Endpoint**: `POST /parse` -> `multipart/form-data` with `file` (PDF, DOC, DOCX, PNG, JPG)

## Directory Structure
```
tools/mineru/
├── app.py              # FastAPI server & layout extraction engine
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── start.bat           # Launch script
├── stop.bat            # Stop script
├── test.bat            # Automated verification test script
├── Dockerfile          # Docker image specification
├── docker-compose.yml  # Docker Compose orchestration specification
└── venv/               # Isolated Python 3.10 virtual environment
```

## Running Service
Execute `start.bat` to launch the FastAPI server.

## Testing
Execute `test.bat` to verify health check and file parsing against sample PDF/DOCX files.
