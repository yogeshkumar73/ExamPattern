# Run Battle Arena Python Battle Service
Write-Host "Starting Battle Service on port 8001..." -ForegroundColor Green

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$ServiceDir = Join-Path $PSScriptRoot "..\server\battle-service"

Push-Location $ServiceDir

# Ensure venv exists
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    & .venv\Scripts\python -m pip install -r requirements.txt
}

# Run server
& .venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

Pop-Location
