import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/services/subscriptionService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const status = await SubscriptionService.getUserStatus(userId)

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error("Error getting subscription status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 