import arcjet, { protectSignup } from "@arcjet/next"

// Initialize Arcjet with signup protection
// This includes bot detection, email validation, and rate limiting
// Note: Set ARCJET_KEY in your environment variables (.env or .env.local)

// Get the key - Next.js automatically loads from .env, .env.local, .env.production, etc.
const getArcjetKey = () => {
  // Check multiple possible locations
  const key = process.env.ARCJET_KEY || process.env.NEXT_PUBLIC_ARCJET_KEY || ""
  
  if (!key) {
    console.warn("⚠️  ARCJET_KEY is not set. Arcjet protection will not work.")
    console.warn("   Please add ARCJET_KEY to your .env.local file")
  }
  
  return key
}

const aj = arcjet({
  key: getArcjetKey(),
  rules: [
    protectSignup({
      bots: {
        allow: ["CATEGORY:SEARCH_ENGINE"], // Allow known search engine bots
      },
      email: {
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"], // Block disposable, invalid emails, and emails without MX records
      },
      rateLimit: {
        max: 5, // Max 5 signups
        interval: 3600, // Per hour (3600 seconds)
      },
    }),
  ],
})

export default aj

