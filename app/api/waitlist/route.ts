import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Waitlist from "@/lib/models/Waitlist"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, industry } = body

    // Validate required fields
    if (!name || !email || !company || !industry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if already on waitlist
    const existingWaitlist = await Waitlist.findOne({ email: email.toLowerCase() })
    if (existingWaitlist) {
      return NextResponse.json({ 
        error: "You're already on our waitlist! We'll notify you when it's ready." 
      }, { status: 409 })
    }

    // Create new waitlist entry
    const newWaitlist = new Waitlist({
      name,
      email: email.toLowerCase(),
      company,
      industry,
      isNotified: false
    })

    // Save to database
    await newWaitlist.save()

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
      data: {
        waitlistId: newWaitlist._id,
        email,
        industry,
        joinedAt: newWaitlist.createdAt
      }
    })

  } catch (error) {
    console.error("Waitlist submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
