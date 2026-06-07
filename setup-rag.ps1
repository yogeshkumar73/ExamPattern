# Aura Study AI - Smart Lab RAG Integration Setup Script (Windows)
# This script sets up the environment for NVIDIA Nemotron 3.5 integration

Write-Host "🚀 Aura Study AI - Smart Lab RAG Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if Node.js is installed
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

$nodeVersion = node -v
Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
    Write-Host "⚠️  Please edit .env.local and add your Open Router API key:" -ForegroundColor Yellow
    Write-Host "   OPEN_ROUTER_API_KEY=sk_live_your_key_here" -ForegroundColor Gray
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your Open Router API key" -ForegroundColor White
Write-Host "   Get it from: https://openrouter.io/keys" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "4. Navigate to the Smart Lab section and start a match!" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see INTEGRATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
