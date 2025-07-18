import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { v4 as uuidv4 } from "uuid"

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
  console.log("Starting application submission process")
  try {
    // Verify transporter configuration
    await transporter.verify()
    console.log("SMTP connection verified")

    const formData = await request.formData()
    console.log("Form data received")

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const position = formData.get("position") as string
    const department = formData.get("department") as string
    const location = formData.get("location") as string
    const experience = formData.get("experience") as string
    const languages = formData.get("languages") as string
    const internetSpeed = formData.get("internetSpeed") as string
    const coverLetter = formData.get("coverLetter") as string

    // Validate required fields
    if (!fullName || !email || !position || !coverLetter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Form data parsed:", { fullName, email, position })

    const files: File[] = []
    const maxFileSize = 5 * 1024 * 1024 // 5MB

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (value.size > maxFileSize) {
          return NextResponse.json({ error: `File ${value.name} exceeds 5MB limit` }, { status: 400 })
        }
        files.push(value)
      }
    }
    console.log(`Number of files received: ${files.length}`)

    console.log("Processing files...")
    const attachments = await Promise.all(
      files.map(async (file) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          return {
            filename: `${uuidv4()}-${file.name}`,
            content: buffer,
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          throw new Error(`Failed to process file: ${file.name}`)
        }
      }),
    )
    console.log("All files processed")

    console.log("Preparing to send emails...")
    // Email to admin
    const adminMailOptions = {
      from: process.env.SMTP_USER || "no-reply@maamul.com",
      to: process.env.ADMIN_EMAIL || "support@maamul.com",
      subject: "New Job Application",
      html: `
        <h2>New Job Application Received</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Internet Speed:</strong> ${internetSpeed} Mbps</p>
        <p><strong>Cover Letter:</strong> ${coverLetter}</p>
        <p><strong>Attached Files:</strong> ${attachments.map((file) => file.filename).join(", ")}</p>
      `,
      attachments: attachments,
    }

    // Email to applicant
    const applicantMailOptions = {
      from: process.env.SMTP_USER || "no-reply@maamul.com",
      to: email,
      subject: "Application Received - Maamul Careers",
      html: `
        <h2>Thank you for your application!</h2>
        <p>Dear ${fullName},</p>
        <p>We have received your application for the ${position} position at Maamul. Our team will review your application and get back to you soon.</p>
        <p>Best regards,<br>Maamul Team</p>
      `,
    }

    // Send both emails with timeout
    console.log("Sending admin email...")
    const emailPromises = [transporter.sendMail(adminMailOptions), transporter.sendMail(applicantMailOptions)]

    await Promise.all(emailPromises)
    console.log("Both emails sent successfully")

    console.log("Application submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
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
        error: "Failed to process application",
        details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
