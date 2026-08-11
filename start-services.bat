@echo off
title Smart Lab — FastAPI Microservices Launcher
color 0A
echo ============================================================
echo   SMART LAB - FastAPI Microservices Startup
echo   AI Service    : http://127.0.0.1:8000
echo   Battle Service: http://127.0.0.1:8001
echo ============================================================
echo.

:: Check Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9+ and add it to PATH.
    pause
    exit /b 1
)

echo [1/4] Installing AI Service dependencies (port 8000)...
cd /d "%~dp0server\ai-service"
pip install -r requirements.txt --quiet --disable-pip-version-check
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install ai-service dependencies.
    pause
    exit /b 1
)
echo     Done.

echo [2/4] Installing Battle Service dependencies (port 8001)...
cd /d "%~dp0server\battle-service"
pip install -r requirements.txt --quiet --disable-pip-version-check
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install battle-service dependencies.
    pause
    exit /b 1
)
echo     Done.

echo [3/4] Launching AI Service on port 8000...
start "AI Service (port 8000)" cmd /k "cd /d "%~dp0server\ai-service" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Small delay so ports don't conflict on init
timeout /t 2 /nobreak >nul

echo [4/4] Launching Battle Service on port 8001...
start "Battle Service (port 8001)" cmd /k "cd /d "%~dp0server\battle-service" && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

echo.
echo ============================================================
echo   Both services are starting in separate windows.
echo   AI Service docs    : http://localhost:8000/docs
echo   Battle Service docs: http://localhost:8001/docs
echo   Health check       : http://localhost:8001/health
echo ============================================================
echo.
echo   Press any key to close this launcher window.
pause >nul
