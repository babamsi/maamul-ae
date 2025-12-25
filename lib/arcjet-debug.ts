/**
 * Debug helper to check Arcjet environment variable loading
 * This helps diagnose why ARCJET_KEY might not be loading
 */

export function debugArcjetEnv() {
  const envVars = {
    ARCJET_KEY: process.env.ARCJET_KEY,
    NEXT_PUBLIC_ARCJET_KEY: process.env.NEXT_PUBLIC_ARCJET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  const hasKey = !!process.env.ARCJET_KEY
  const keyLength = process.env.ARCJET_KEY?.length || 0
  const keyPreview = process.env.ARCJET_KEY
    ? `${process.env.ARCJET_KEY.substring(0, 10)}...${process.env.ARCJET_KEY.substring(process.env.ARCJET_KEY.length - 4)}`
    : "not set"

  return {
    configured: hasKey,
    keyLength,
    keyPreview: hasKey ? keyPreview : "not set",
    allEnvVars: envVars,
    message: hasKey
      ? `✅ ARCJET_KEY is set (${keyLength} chars)`
      : "❌ ARCJET_KEY is not set",
    instructions: hasKey
      ? []
      : [
          "1. Create or edit .env.local file in project root",
          "2. Add: ARCJET_KEY=your_key_here",
          "3. Restart your development server (npm run dev)",
          "4. Note: Next.js uses .env.local for local development",
        ],
  }
}





