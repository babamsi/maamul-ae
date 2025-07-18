import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const position = formData.get("position") as string
    const coverLetter = formData.get("coverLetter") as string
    const resume = formData.get("resume") as File

    // Validate required fields
    if (!fullName || !email || !phone || !position || !coverLetter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!resume) {
      return NextResponse.json({ error: "Resume is required" }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (resume.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Resume file size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to buffer for email attachment
    const resumeBuffer = Buffer.from(await resume.arrayBuffer())

    // Create transporter with environment variables and fallbacks
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "maamulteam@gmail.com",
        pass: process.env.SMTP_PASS || "vzyy hfpv iytm sxzh",
      },
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
    } catch (error) {
      console.error("SMTP configuration error:", error)
      return NextResponse.json({ error: "Email service configuration error" }, { status: 500 })
    }

    const mailOptions = {
      from: process.env.SMTP_USER || "maamulteam@gmail.com",
      to: "maamulteam@gmail.com",
      subject: `New Job Application: ${position}`,
      html: `
        <h2>New Job Application Received</h2>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Cover Letter:</strong></p>
        <p>${coverLetter.replace(/\n/g, "<br>")}</p>
      `,
      attachments: [
        {
          filename: `${fullName}_Resume_${position}.${resume.name.split(".").pop()}`,
          content: resumeBuffer,
        },
      ],
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      message: "Application submitted successfully! We will review your application and get back to you soon.",
    })
  } catch (error) {
    console.error("Error processing application:", error)

    // Return different error messages based on environment
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        : "Failed to submit application. Please try again later."

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
