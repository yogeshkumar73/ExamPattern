# Verification Script for Smart Lab RAG Implementation
# Run this to verify all components are working

Write-Host "🔍 Smart Lab RAG Implementation Verification" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

function CheckMark {
    Write-Host "✅ $args" -ForegroundColor Green
}

function ErrorMark {
    Write-Host "❌ $args" -ForegroundColor Red
}

function WarningMark {
    Write-Host "⚠️ $args" -ForegroundColor Yellow
}

Write-Host "Checking files..." -ForegroundColor White
Write-Host ""

# Check if files exist
if (Test-Path "lib/services/openRouterService.ts") {
    CheckMark "openRouterService.ts exists"
} else {
    ErrorMark "openRouterService.ts not found"
}

if (Test-Path "app/api/ai/content-generation/route.ts") {
    CheckMark "content-generation API endpoint exists"
} else {
    ErrorMark "content-generation API endpoint not found"
}

if (Test-Path ".env.example") {
    CheckMark ".env.example exists"
} else {
    ErrorMark ".env.example not found"
}

if (Test-Path ".env.local") {
    CheckMark ".env.local exists"
    
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match "OPEN_ROUTER_API_KEY") {
        if ($envContent -match "OPEN_ROUTER_API_KEY=sk_live_") {
            CheckMark "OPEN_ROUTER_API_KEY is configured"
        } else {
            WarningMark "OPEN_ROUTER_API_KEY is set but may not be valid (should start with sk_live_)"
        }
    } else {
        ErrorMark "OPEN_ROUTER_API_KEY not found in .env.local"
    }
} else {
    WarningMark ".env.local not found (copy from .env.example and configure it)"
}

if (Test-Path "scripts/test-integration.js") {
    CheckMark "Integration tests exist"
} else {
    ErrorMark "Integration tests not found"
}

if (Test-Path "INTEGRATION_GUIDE.md") {
    CheckMark "Integration guide exists"
} else {
    ErrorMark "Integration guide not found"
}

if (Test-Path "QUICKSTART_RAG.md") {
    CheckMark "Quick start guide exists"
} else {
    ErrorMark "Quick start guide not found"
}

if (Test-Path "IMPLEMENTATION_SUMMARY.md") {
    CheckMark "Implementation summary exists"
} else {
    ErrorMark "Implementation summary not found"
}

Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor White
Write-Host ""

if (Test-Path "node_modules") {
    CheckMark "node_modules directory exists"
} else {
    WarningMark "node_modules not found (run: npm install)"
}

try {
    $nodeVersion = node -v 2>$null
    CheckMark "Node.js is installed ($nodeVersion)"
} catch {
    ErrorMark "Node.js is not installed"
}

try {
    $npmVersion = npm -v 2>$null
    CheckMark "npm is installed ($npmVersion)"
} catch {
    ErrorMark "npm is not installed"
}

Write-Host ""
Write-Host "Checking lab-games component..." -ForegroundColor White
Write-Host ""

$labGamesContent = Get-Content "components/lab-games.tsx" -Raw
if ($labGamesContent -match "fetchDynamicQuestions") {
    CheckMark "Lab games component has dynamic question loading"
} else {
    ErrorMark "Lab games component missing dynamic question loading"
}

if ($labGamesContent -match "isLoadingQuestions") {
    CheckMark "Lab games component has loading state handling"
} else {
    ErrorMark "Lab games component missing loading state handling"
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✨ Verification Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. If any errors above, fix them first" -ForegroundColor White
Write-Host "2. Configure .env.local with your OpenRouter API key" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Run: npm run test:integration (optional but recommended)" -ForegroundColor White
Write-Host "5. Visit http://localhost:3000 and try the Smart Lab" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see:" -ForegroundColor Cyan
Write-Host "  - QUICKSTART_RAG.md (quick start guide)" -ForegroundColor Gray
Write-Host "  - INTEGRATION_GUIDE.md (comprehensive guide)" -ForegroundColor Gray
Write-Host "  - IMPLEMENTATION_SUMMARY.md (implementation details)" -ForegroundColor Gray
Write-Host ""
