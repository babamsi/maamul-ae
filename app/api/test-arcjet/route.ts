import { NextRequest, NextResponse } from "next/server"
import aj from "@/lib/arcjet"
import { debugArcjetEnv } from "@/lib/arcjet-debug"

/**
 * Test endpoint to verify Arcjet is working correctly
 * GET /api/test-arcjet?email=test@example.com
 */
export async function GET(request: NextRequest) {
  try {
    // Debug environment variable loading
    const envDebug = debugArcjetEnv()
    
    // Check if ARCJET_KEY is set
    const hasKey = !!process.env.ARCJET_KEY
    const keyLength = process.env.ARCJET_KEY?.length || 0

    // Get email from query params for testing
    const searchParams = request.nextUrl.searchParams
    const testEmail = searchParams.get("email") || "test@example.com"

    // Test Arcjet protection
    let arcjetResult = {
      configured: hasKey,
      keyLength: keyLength,
      testEmail: testEmail,
      decision: null as any,
      error: null as string | null,
    }

    try {
      const decision = await aj.protect(request, {
        email: testEmail,
      })

      arcjetResult.decision = {
        isDenied: decision.isDenied(),
        isAllowed: !decision.isDenied(),
        reason: decision.isDenied() ? {
          isBot: decision.reason.isBot(),
          isRateLimit: decision.reason.isRateLimit(),
          isEmail: decision.reason.isEmail(),
        } : null,
      }
    } catch (error: any) {
      arcjetResult.error = error.message || String(error)
    }

    return NextResponse.json({
      success: true,
      arcjet: {
        configured: hasKey,
        keyPresent: hasKey && keyLength > 0,
        keyLength: keyLength,
        keyPreview: envDebug.keyPreview,
        testResults: arcjetResult,
        message: hasKey
          ? "Arcjet is configured. Check the testResults to see if protection is working."
          : "⚠️ ARCJET_KEY is not set in environment variables. Arcjet will not work until you add your API key.",
        envDebug: envDebug,
      },
      instructions: {
        setup: "1. Get your API key from https://arcjet.com",
        envVar: "2. Add ARCJET_KEY=your_key_here to your .env.local file (NOT .env)",
        note: "⚠️  Next.js uses .env.local for local development. Make sure you're using .env.local, not .env",
        restart: "3. Restart your dev server: npm run dev",
        test: "4. Test with: GET /api/test-arcjet?email=test@example.com",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to test Arcjet with a real signup-like request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email || "test@example.com"

    // Test Arcjet protection
    const decision = await aj.protect(request, {
      email,
    })

    return NextResponse.json({
      success: true,
      email: email,
      arcjet: {
        isDenied: decision.isDenied(),
        isAllowed: !decision.isDenied(),
        reason: decision.isDenied()
          ? {
              isBot: decision.reason.isBot(),
              isRateLimit: decision.reason.isRateLimit(),
              isEmail: decision.reason.isEmail(),
            }
          : null,
      },
      message: decision.isDenied()
        ? "❌ Request would be blocked by Arcjet"
        : "✅ Request would be allowed by Arcjet",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
      },
      { status: 500 }
    )
  }
}

