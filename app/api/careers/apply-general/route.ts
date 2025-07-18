import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: Number.parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "no-reply@maamul.com",
    pass: process.env.SMTP_PASS || "69APsXQkuLuw",
  },
})

export async function POST(request: Request) {
  try {
    // Verify transporter configuration
    await transporter.verify()
    console.log("SMTP connection verified")

    const formData = await request.formData()
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const coverLetter = formData.get("coverLetter") as string
    const resume = formData.get("resume") as File | null

    // Validate required fields
    if (!fullName || !email || !coverLetter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const attachments = []
    if (resume) {
      const maxFileSize = 5 * 1024 * 1024 // 5MB
      if (resume.size > maxFileSize) {
        return NextResponse.json({ error: "Resume file exceeds 5MB limit" }, { status: 400 })
      }

      try {
        const buffer = Buffer.from(await resume.arrayBuffer())
        attachments.push({
          filename: resume.name,
          content: buffer,
        })
      } catch (error) {
        console.error("Error processing resume file:", error)
        return NextResponse.json({ error: "Failed to process resume file" }, { status: 400 })
      }
    }

    // Email to admin
    const adminMailOptions = {
      from: process.env.SMTP_USER || "no-reply@maamul.com",
      to: process.env.ADMIN_EMAIL || "support@maamul.com",
      subject: "New General Job Application",
      html: `
        <h2>New General Job Application Received</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Cover Letter:</strong> ${coverLetter}</p>
        <p><strong>Resume:</strong> ${resume ? resume.name : "Not provided"}</p>
      `,
      attachments: attachments,
    }

    // Email to applicant
    const applicantMailOptions = {
      from: process.env.SMTP_USER || "no-reply@maamul.com",
      to: email,
      subject: "General Application Received - Maamul Careers",
      html: `
        <h2>Thank you for your general application!</h2>
        <p>Dear ${fullName},</p>
        <p>We have received your general application for Maamul. Our team will review your application and get back to you if we have any suitable positions matching your skills and experience.</p>
        <p>Best regards,<br>Maamul Team</p>
      `,
    }

    // Send both emails
    await Promise.all([transporter.sendMail(adminMailOptions), transporter.sendMail(applicantMailOptions)])

    return NextResponse.json({
      success: true,
      message: "General application submitted successfully",
    })
  } catch (error) {
    console.error("Application submission error:", error)

    // More specific error handling
    if (error.code === "EAUTH") {
      return NextResponse.json({ error: "Email authentication failed" }, { status: 500 })
    }

    if (error.code === "ECONNECTION") {
      return NextResponse.json({ error: "Email server connection failed" }, { status: 500 })
    }

    return NextResponse.json(
      {
        error: "Failed to process general application",
        details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
