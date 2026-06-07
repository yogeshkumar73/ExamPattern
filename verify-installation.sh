#!/bin/bash

# Verification Script for Smart Lab RAG Implementation
# Run this to verify all components are working

echo "🔍 Smart Lab RAG Implementation Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_mark() {
  echo -e "${GREEN}✅${NC} $1"
}

error_mark() {
  echo -e "${RED}❌${NC} $1"
}

warning_mark() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

echo "Checking files..."
echo ""

# Check if files exist
if [ -f "lib/services/openRouterService.ts" ]; then
  check_mark "openRouterService.ts exists"
else
  error_mark "openRouterService.ts not found"
fi

if [ -f "app/api/ai/content-generation/route.ts" ]; then
  check_mark "content-generation API endpoint exists"
else
  error_mark "content-generation API endpoint not found"
fi

if [ -f ".env.example" ]; then
  check_mark ".env.example exists"
else
  error_mark ".env.example not found"
fi

if [ -f ".env.local" ]; then
  check_mark ".env.local exists"
  
  if grep -q "OPEN_ROUTER_API_KEY" .env.local; then
    if grep -q "OPEN_ROUTER_API_KEY=sk_live_" .env.local; then
      check_mark "OPEN_ROUTER_API_KEY is configured"
    else
      warning_mark "OPEN_ROUTER_API_KEY is set but may not be valid (should start with sk_live_)"
    fi
  else
    error_mark "OPEN_ROUTER_API_KEY not found in .env.local"
  fi
else
  warning_mark ".env.local not found (copy from .env.example and configure it)"
fi

if [ -f "scripts/test-integration.js" ]; then
  check_mark "Integration tests exist"
else
  error_mark "Integration tests not found"
fi

if [ -f "INTEGRATION_GUIDE.md" ]; then
  check_mark "Integration guide exists"
else
  error_mark "Integration guide not found"
fi

if [ -f "QUICKSTART_RAG.md" ]; then
  check_mark "Quick start guide exists"
else
  error_mark "Quick start guide not found"
fi

if [ -f "IMPLEMENTATION_SUMMARY.md" ]; then
  check_mark "Implementation summary exists"
else
  error_mark "Implementation summary not found"
fi

echo ""
echo "Checking dependencies..."
echo ""

if [ -d "node_modules" ]; then
  check_mark "node_modules directory exists"
else
  warning_mark "node_modules not found (run: npm install)"
fi

if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  check_mark "Node.js is installed ($NODE_VERSION)"
else
  error_mark "Node.js is not installed"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  check_mark "npm is installed ($NPM_VERSION)"
else
  error_mark "npm is not installed"
fi

echo ""
echo "Checking lab-games component..."
echo ""

if grep -q "fetchDynamicQuestions" components/lab-games.tsx; then
  check_mark "Lab games component has dynamic question loading"
else
  error_mark "Lab games component missing dynamic question loading"
fi

if grep -q "isLoadingQuestions" components/lab-games.tsx; then
  check_mark "Lab games component has loading state handling"
else
  error_mark "Lab games component missing loading state handling"
fi

echo ""
echo "=============================================="
echo "✨ Verification Complete!"
echo ""
echo "Next steps:"
echo "1. If any errors above, fix them first"
echo "2. Configure .env.local with your OpenRouter API key"
echo "3. Run: npm run dev"
echo "4. Run: npm run test:integration (optional but recommended)"
echo "5. Visit http://localhost:3000 and try the Smart Lab"
echo ""
echo "For more details, see:"
echo "  - QUICKSTART_RAG.md (quick start guide)"
echo "  - INTEGRATION_GUIDE.md (comprehensive guide)"
echo "  - IMPLEMENTATION_SUMMARY.md (implementation details)"
echo ""
