import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, industry } = await request.json()

    // Validate required fields
    if (!name || !email || !company || !industry) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Waitlist Registration - ${industry}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #392A17;">New Waitlist Registration</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Industry:</strong> ${industry}</p>
          </div>
          <p>This user is interested in Maamul for the ${industry} industry.</p>
        </div>
      `,
    }

    // Email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to the Maamul Waitlist!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #392A17;">𐒑 Maamul</h1>
            <h2>Thank you for joining our waitlist!</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Hi ${name},</p>
            <p>Thank you for your interest in Maamul for the <strong>${industry}</strong> industry!</p>
            <p>We're working hard to bring our comprehensive business management solution to your industry. You'll be among the first to know when we're ready to help streamline your ${industry.toLowerCase()} operations.</p>
          </div>

          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #392A17;">What to expect:</h3>
            <ul>
              <li>Early access notification when ${industry} setup becomes available</li>
              <li>Special pricing for early adopters</li>
              <li>Personalized onboarding and setup assistance</li>
              <li>Industry-specific features and integrations</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p>Questions? Reply to this email or contact us at support@maamul.com</p>
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The Maamul Team
            </p>
          </div>
        </div>
      `,
    }

    // Send emails
    await transporter.sendMail(adminMailOptions)
    await transporter.sendMail(userMailOptions)

    return NextResponse.json({ message: "Successfully joined waitlist" })
  } catch (error) {
    console.error("Waitlist submission error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
