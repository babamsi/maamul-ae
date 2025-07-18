import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { isEmailWhitelisted } from "@/lib/email-whitelist"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, industry, businessType, location, email, phone, fullName, teamMembers } = body

    // Validate required fields
    if (!businessName || !industry || !email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if email domain is whitelisted
    if (!isEmailWhitelisted(email)) {
      return NextResponse.json(
        {
          error: "Email domain not authorized. Please contact support for access.",
          code: "DOMAIN_NOT_WHITELISTED",
        },
        { status: 403 },
      )
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Verify SMTP configuration
    try {
      await transporter.verify()
    } catch (error) {
      console.error("SMTP configuration error:", error)
      return NextResponse.json({ error: "Email service configuration error" }, { status: 500 })
    }

    // Prepare email content
    const teamMembersList =
      teamMembers && teamMembers.length > 0
        ? teamMembers
            .map(
              (member: any) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${member.name || "N/A"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${member.email || "N/A"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${member.role || "N/A"}</td>
          </tr>
        `,
            )
            .join("")
        : '<tr><td colspan="3" style="padding: 8px; text-align: center; color: #666;">No team members added</td></tr>'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Business Registration</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Maamul Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Business Information</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Business Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Industry:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${industry}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Business Type:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${businessType || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Location:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${location || "Not specified"}</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 30px;">Contact Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Full Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${phone || "Not provided"}</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 30px;">Team Members</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Name</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Role</th>
              </tr>
            </thead>
            <tbody>
              ${teamMembersList}
            </tbody>
          </table>

          <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              This registration was submitted on ${new Date().toLocaleString()} through the Maamul onboarding process.
            </p>
          </div>
        </div>
      </div>
    `

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "admin@maamul.com",
      subject: `New Business Registration: ${businessName}`,
      html: emailHtml,
      replyTo: email,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log("Registration email sent successfully")
    } catch (error) {
      console.error("Failed to send email:", error)
      // Don't fail the request if email fails, just log it
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      data: {
        businessName,
        email,
        registrationDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 })
  }
}
