#!/bin/bash

# ProofLocker Scoring System Test
# Tests that the scoring system correctly awards points for locking and resolving predictions

echo "🧪 Testing ProofLocker Scoring System"
echo "======================================"
echo ""

# Generate a test anon ID
TEST_ANON_ID="test-$(uuidgen | tr '[:upper:]' '[:lower:]')"
echo "📝 Using test anon ID: $TEST_ANON_ID"
echo ""

# Step 1: Check initial score (should be 0)
echo "1️⃣ Checking initial score..."
INITIAL_RESPONSE=$(curl -s "http://localhost:3000/api/insight/current?anonId=$TEST_ANON_ID")
echo "Response: $INITIAL_RESPONSE"
INITIAL_POINTS=$(echo $INITIAL_RESPONSE | jq -r '.score.totalPoints // 0')
echo "✓ Initial points: $INITIAL_POINTS"
echo ""

# Step 2: Lock a prediction (+10 points)
echo "2️⃣ Locking a prediction..."
LOCK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/lock-proof \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Bitcoin will reach \$100k by end of 2026\",
    \"userId\": \"$TEST_ANON_ID\",
    \"category\": \"Crypto\"
  }")

PREDICTION_ID=$(echo $LOCK_RESPONSE | jq -r '.predictionId')
INSIGHT_POINTS=$(echo $LOCK_RESPONSE | jq -r '.insightPoints // 0')
echo "✓ Prediction ID: $PREDICTION_ID"
echo "✓ Points awarded: $INSIGHT_POINTS (expected: 10)"
echo ""

# Wait a moment for DB to update
sleep 2

# Step 3: Check score after lock
echo "3️⃣ Checking score after lock..."
AFTER_LOCK=$(curl -s "http://localhost:3000/api/insight/current?anonId=$TEST_ANON_ID")
AFTER_LOCK_POINTS=$(echo $AFTER_LOCK | jq -r '.score.totalPoints // 0')
echo "✓ Total points after lock: $AFTER_LOCK_POINTS (expected: 10)"
echo ""

# Step 4: Test the resolve endpoint (simulated - requires auth)
echo "4️⃣ Testing resolve endpoint configuration..."
echo "   (Actual resolve requires authentication)"
echo "   Checking if awardResolvePoints is imported..."

if grep -q "awardResolvePoints" src/app/api/predictions/[id]/resolve/route.ts; then
    echo "   ✓ resolve/route.ts has awardResolvePoints import"
else
    echo "   ✗ resolve/route.ts missing awardResolvePoints import"
fi

if grep -q "awardResolvePoints" src/app/api/predictions/[id]/outcome/route.ts; then
    echo "   ✓ outcome/route.ts has awardResolvePoints import"
else
    echo "   ✗ outcome/route.ts missing awardResolvePoints import"
fi
echo ""

# Step 5: Check environment variables
echo "5️⃣ Checking environment variables..."
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "   ✓ SUPABASE_SERVICE_ROLE_KEY is set"
else
    echo "   ✗ SUPABASE_SERVICE_ROLE_KEY is not set in environment"
    echo "   Checking .env.local..."
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "   ✓ Found in .env.local (restart server to load)"
    else
        echo "   ✗ Not found in .env.local either"
    fi
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo "Initial Points:     $INITIAL_POINTS"
echo "After Lock:         $AFTER_LOCK_POINTS"
echo "Points Awarded:     $INSIGHT_POINTS"
echo ""

if [ "$AFTER_LOCK_POINTS" -gt "$INITIAL_POINTS" ]; then
    echo "✅ SUCCESS: Scoring system is working!"
    echo "   Points increased after locking a prediction."
else
    echo "⚠️  WARNING: Points did not increase"
    echo "   Check server logs for errors"
fi

echo ""
echo "Next steps:"
echo "1. Open the app and claim a prediction"
echo "2. Resolve it as correct/incorrect"
echo "3. Check that resolve awards 50-120 points"
echo "4. Verify Reliability Score updates"
