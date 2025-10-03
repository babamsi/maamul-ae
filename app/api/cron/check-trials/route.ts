import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/services/subscriptionService"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is called by the cron service
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check and expire trials
    const expiredCount = await SubscriptionService.checkExpiredTrials()
    
    // Send expiration notifications
    const notifiedCount = await SubscriptionService.sendExpirationNotifications()

    return NextResponse.json({
      success: true,
      message: "Trial check completed successfully",
      data: {
        expiredTrials: expiredCount,
        notificationsSent: notifiedCount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Error in trial check cron job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 