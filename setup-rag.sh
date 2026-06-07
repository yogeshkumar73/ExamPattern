#!/bin/bash

# Aura Study AI - Smart Lab RAG Integration Setup Script
# This script sets up the environment for NVIDIA Nemotron 3.5 integration

echo "🚀 Aura Study AI - Smart Lab RAG Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your Open Router API key:"
    echo "   OPEN_ROUTER_API_KEY=sk_live_your_key_here"
else
    echo "✅ .env.local already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install || pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Verify required environment variable
if [ -z "$OPEN_ROUTER_API_KEY" ] && [ ! -f .env.local ]; then
    echo "❌ OPEN_ROUTER_API_KEY not set"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.local and add your Open Router API key"
echo "   Get it from: https://openrouter.io/keys"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "4. Navigate to the Smart Lab section and start a match!"
echo ""
echo "📚 For more information, see INTEGRATION_GUIDE.md"
echo "=========================================="
