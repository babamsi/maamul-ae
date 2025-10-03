import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/services/subscriptionService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await SubscriptionService.cancelSubscription(userId)

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: {
        userId: user.id,
        email: user.email,
        subscriptionStatus: user.subscription_status
      }
    })

  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 