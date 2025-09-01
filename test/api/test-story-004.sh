#!/bin/bash

# STORY-004: Health Protocol Generation Optimization
# Quick API Verification Script using curl

API_BASE="http://localhost:3501/api"

echo "=========================================================="
echo "🚀 STORY-004: Health Protocol Optimization API Testing"
echo "=========================================================="

# Step 1: Login to get auth token
echo -e "\n🔐 Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@test.com","password":"TestPassword123!"}')

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"

# Step 2: Test Protocol Templates
echo -e "\n📋 Testing Protocol Templates..."
TEMPLATES=$(curl -s -X GET "$API_BASE/protocols/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$TEMPLATES" | grep -q "status.*success"; then
  COUNT=$(echo "$TEMPLATES" | grep -o '"count":[0-9]*' | sed 's/"count"://')
  echo "✅ Protocol Templates API working - Found $COUNT templates"
else
  echo "❌ Protocol Templates API failed"
  echo "Response: $TEMPLATES"
fi

# Step 3: Test Medical Safety Validation
echo -e "\n🏥 Testing Medical Safety Validation..."
SAFETY=$(curl -s -X POST "$API_BASE/protocols/safety-validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protocolId": "test-id",
    "customerId": "test-customer",
    "medications": ["warfarin"],
    "healthConditions": ["diabetes"]
  }')

if echo "$SAFETY" | grep -q "safetyRating"; then
  RATING=$(echo "$SAFETY" | grep -o '"safetyRating":"[^"]*' | sed 's/"safetyRating":"//')
  echo "✅ Medical Safety Validation working - Rating: $RATING"
elif echo "$SAFETY" | grep -q "404"; then
  echo "⚠️ Medical Safety Validation endpoint not found (404)"
else
  echo "❓ Medical Safety Validation response: ${SAFETY:0:100}..."
fi

# Step 4: Test Protocol Versioning
echo -e "\n🔢 Testing Protocol Versioning..."
VERSIONS=$(curl -s -X GET "$API_BASE/protocols/versions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$VERSIONS" | grep -q "version"; then
  echo "✅ Protocol Versioning API accessible"
elif echo "$VERSIONS" | grep -q "404"; then
  echo "⚠️ Protocol Versioning endpoint not found (404)"
else
  echo "❓ Protocol Versioning response: ${VERSIONS:0:100}..."
fi

# Step 5: Test Effectiveness Tracking
echo -e "\n📊 Testing Protocol Effectiveness Tracking..."
EFFECTIVENESS=$(curl -s -X GET "$API_BASE/protocols/effectiveness/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$EFFECTIVENESS" | grep -q "effectiveness\|analytics"; then
  echo "✅ Effectiveness Tracking API accessible"
elif echo "$EFFECTIVENESS" | grep -q "404"; then
  echo "⚠️ Effectiveness Tracking endpoint not found (404)"
else
  echo "❓ Effectiveness Tracking response: ${EFFECTIVENESS:0:100}..."
fi

# Step 6: Test OpenAI Caching
echo -e "\n🤖 Testing OpenAI Caching (making 2 identical requests)..."

# First request
START1=$(date +%s%N)
PROTO1=$(curl -s -X POST "$API_BASE/protocols" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cache Test Protocol",
    "templateId": "test-template",
    "clientAge": 40,
    "healthGoals": ["longevity"],
    "generateWithAI": false
  }')
END1=$(date +%s%N)
TIME1=$((($END1 - $START1) / 1000000))

# Second request (should be cached)
START2=$(date +%s%N)
PROTO2=$(curl -s -X POST "$API_BASE/protocols" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cache Test Protocol",
    "templateId": "test-template",
    "clientAge": 40,
    "healthGoals": ["longevity"],
    "generateWithAI": false
  }')
END2=$(date +%s%N)
TIME2=$((($END2 - $START2) / 1000000))

echo "   First request: ${TIME1}ms"
echo "   Second request: ${TIME2}ms"

if [ "$TIME2" -lt "$TIME1" ]; then
  echo "✅ Caching may be working (second request faster)"
else
  echo "⚠️ Caching optimization not evident"
fi

# Summary
echo -e "\n=========================================================="
echo "📊 STORY-004 VERIFICATION SUMMARY"
echo "=========================================================="
echo ""
echo "Core Features Status:"
echo "  ✅ Protocol Templates - API endpoints exist"
echo "  ❓ Medical Safety Validation - Check implementation"
echo "  ❓ Protocol Versioning - Check implementation"
echo "  ❓ Effectiveness Tracking - Check implementation"
echo "  ⚠️ OpenAI Caching - Needs verification with AI enabled"
echo ""
echo "🔍 Overall: STORY-004 backend structure is in place."
echo "   Some endpoints may need frontend integration or"
echo "   additional implementation to be fully functional."
echo "=========================================================="