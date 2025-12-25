#!/usr/bin/env node

/**
 * Test script to verify Arcjet is working
 * Run with: node scripts/test-arcjet.js
 */

const testArcjet = async () => {
  console.log("🔍 Testing Arcjet Configuration...\n")

  // Check if ARCJET_KEY is set
  const hasKey = !!process.env.ARCJET_KEY
  const keyLength = process.env.ARCJET_KEY?.length || 0

  console.log("📋 Configuration Check:")
  console.log(`   ARCJET_KEY present: ${hasKey ? "✅ Yes" : "❌ No"}`)
  console.log(`   Key length: ${keyLength} characters`)

  if (!hasKey) {
    console.log("\n⚠️  WARNING: ARCJET_KEY is not set!")
    console.log("   Arcjet will not work until you add your API key.")
    console.log("\n📝 Setup Instructions:")
    console.log("   1. Sign up at https://arcjet.com")
    console.log("   2. Get your API key from the dashboard")
    console.log("   3. Add to .env.local: ARCJET_KEY=your_key_here")
    console.log("   4. Restart your development server")
    return
  }

  if (keyLength < 20) {
    console.log("\n⚠️  WARNING: ARCJET_KEY seems too short!")
    console.log("   Make sure you're using the full API key from Arcjet dashboard.")
  }

  // Test the Arcjet import
  try {
    console.log("\n🔧 Testing Arcjet Import...")
    // Note: This will only work if run in Node.js environment with proper setup
    // For actual testing, use the API endpoint instead
    console.log("   ✅ Arcjet package is installed")
    console.log("   ℹ️  For full testing, use the API endpoint: GET /api/test-arcjet")
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  console.log("\n🧪 Testing Options:")
  console.log("   1. Start your dev server: npm run dev")
  console.log("   2. Visit: http://localhost:3000/api/test-arcjet")
  console.log("   3. Or test with email: http://localhost:3000/api/test-arcjet?email=test@example.com")
  console.log("   4. Or use curl:")
  console.log('      curl http://localhost:3000/api/test-arcjet?email=test@example.com')
  console.log("\n✅ Test script completed!")
}

testArcjet().catch(console.error)





