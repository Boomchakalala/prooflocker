#!/bin/bash

# OSINT Pipeline Quick Test Script
# This script tests your OSINT aggregation setup

echo "🚀 ProofLocker OSINT Pipeline Test"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "   Create it by copying .env.example:"
    echo "   cp .env.example .env.local"
    exit 1
fi

# Check for required environment variables
echo "📋 Checking environment variables..."

if ! grep -q "ANTHROPIC_API_KEY=" .env.local || grep -q "ANTHROPIC_API_KEY=your" .env.local; then
    echo "❌ ANTHROPIC_API_KEY not set in .env.local"
    echo "   Get your key from: https://console.anthropic.com/"
    exit 1
fi

if ! grep -q "SUPABASE_SERVICE_ROLE_KEY=" .env.local || grep -q "SUPABASE_SERVICE_ROLE_KEY=your" .env.local; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in .env.local"
    echo "   Get it from Supabase dashboard → Settings → API"
    exit 1
fi

if ! grep -q "CRON_SECRET=" .env.local || grep -q "CRON_SECRET=change-this" .env.local; then
    echo "⚠️  Warning: CRON_SECRET not set or using default"
    echo "   Set a random string in .env.local for security"
fi

echo "✅ Environment variables look good"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."

if [ ! -d "node_modules/@anthropic-ai/sdk" ]; then
    echo "❌ @anthropic-ai/sdk not installed"
    echo "   Run: npm install"
    exit 1
fi

if [ ! -d "node_modules/rss-parser" ]; then
    echo "❌ rss-parser not installed"
    echo "   Run: npm install"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if dev server is running
echo "🔍 Checking if dev server is running..."

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server not running"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo ""

# Trigger ingestion manually
echo "🚀 Triggering OSINT ingestion..."
echo "   This will:"
echo "   - Fetch articles from NewsAPI + RSS"
echo "   - Extract locations with Claude AI"
echo "   - Store in Supabase"
echo ""

# Read CRON_SECRET from .env.local
CRON_SECRET=$(grep "CRON_SECRET=" .env.local | cut -d '=' -f2)

RESPONSE=$(curl -s -X POST http://localhost:3000/api/osint/ingest \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Ingestion successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Check Supabase dashboard → osint_signals table"
    echo "   2. Visit http://localhost:3000/globe"
    echo "   3. Visit http://localhost:3000/app"
    echo "   4. Set up cron job (see OSINT_SETUP.md)"
else
    echo "❌ Ingestion failed"
    echo "   Check the error above"
    echo "   Common issues:"
    echo "   - Invalid API keys"
    echo "   - Database permissions"
    echo "   - Network errors"
fi

echo ""
echo "📖 For full setup guide, see: OSINT_SETUP.md"
