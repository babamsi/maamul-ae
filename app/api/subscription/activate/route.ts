import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/services/subscriptionService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, duration } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: "User ID and plan are required" }, { status: 400 })
    }

    const user = await SubscriptionService.activateSubscription(userId, plan, duration || 30)

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      data: {
        userId: user.id,
        email: user.email,
        subscriptionPlan: user.subscription_plan,
        subscriptionEndDate: user.subscription_end_date
      }
    })

  } catch (error) {
    console.error("Error activating subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 