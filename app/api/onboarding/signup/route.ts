import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import { isEmailWhitelisted } from "@/lib/email-whitelist"
import { supabaseAdmin } from "@/lib/supabase"
import { DatabaseNameService } from "@/lib/services/databaseNameService"
import { DatabaseCreatorService } from "@/lib/services/databaseCreatorService"
import aj from "@/lib/arcjet"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(body)
    
    const { 
      businessName, 
      industry, 
      businessType, 
      location, 
      email, 
      phone, 
      fullName, 
      teamMembers, 
      managerName, 
      companyName,
      businessAge,
      primaryGoal,
      biggestChallenge,
      dailyHours,
      password,
      confirmPassword,
      onboardingData
    } = body

    // Validate required fields
    if (!companyName || !industry || !email || !managerName || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Arcjet protection: Bot detection, email validation, and rate limiting
    // This must be called after we have the email from the request body
    const decision = await aj.protect(request, {
      email, // Pass email for validation
    })
    
    if (decision.isDenied()) {
      // Check the reason for denial
      const reason = decision.reason
      
      if (reason.isBot()) {
        return NextResponse.json(
          { error: "Automated requests are not allowed. Please complete the signup manually." },
          { status: 403 }
        )
      }
      
      if (reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too many signup attempts. Please try again later." },
          { status: 429 }
        )
    }

      if (reason.isEmail()) {
        // Email validation failed - provide generic error message
        // Arcjet handles the specific validation (invalid, disposable, no MX records)
        return NextResponse.json(
          { error: "Email validation failed. Please use a valid email address." },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Request blocked for security reasons" },
        { status: 403 }
      )
    }

    // Check if email domain is whitelisted
    // if (!isEmailWhitelisted(email)) {
    //   return NextResponse.json(
    //     {
    //       error: "Email domain not authorized. Please contact support for access.",
    //       code: "DOMAIN_NOT_WHITELISTED",
    //     },
    //     { status: 403 },
    //   )
    // }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    // Check if user already exists (Supabase)
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1)
      .maybeSingle()

    if (existingErr) {
      console.error('Supabase select error:', existingErr)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate unique database name
    const databaseName = await DatabaseNameService.generateDatabaseName(companyName)

    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Insert user into Supabase
    const trialStart = new Date()
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('users')
      .insert({
        manager_name: managerName,
        company_name: companyName,
        manager_email: email.toLowerCase(),
        phone: phone || null,
        location: location || null,
        business_age: businessAge || null,
        primary_goal: primaryGoal || null,
        biggest_challenge: biggestChallenge || null,
        daily_hours: dailyHours || null,
        password_hash: hashedPassword,
        industry,
        onboarding_data: onboardingData,
        team_members: teamMembers || [],
        is_active: true,
        is_verified: false,
        database_name: databaseName,
        trial_start_date: trialStart.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        is_trial_active: true,
        subscription_status: 'trial',
      })
      .select('id, database_name, trial_end_date, created_at')
      .single()

    if (insertErr) {
      console.error('Supabase insert error:', insertErr)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create new database and models for the user
    try {
      await DatabaseCreatorService.createDatabaseAndModels(databaseName, inserted.id)
      console.log(`✅ User database '${databaseName}' created successfully`)
    } catch (error) {
      console.error(`❌ Error creating user database:`, error)
      // Don't fail the signup if database creation fails, just log it
    }

    // Configure nodemailer transporter with better connection options
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com"
    const emailPort = Number.parseInt(process.env.EMAIL_PORT || "587")
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    // Only attempt to send email if credentials are configured
    let transporter: nodemailer.Transporter | null = null
    if (emailUser && emailPass) {
      const transportConfig = {
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
      auth: {
          user: emailUser,
          pass: emailPass,
      },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false,
        },
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        // Don't use connection pooling in serverless environments
        // This prevents socket close issues
        pool: false,
      } as nodemailer.TransportOptions

      transporter = nodemailer.createTransport(transportConfig)
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Business Registration</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #392A17; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <div style="font-size: 60px; color: #D6B98F; margin-bottom: 15px; text-align: center;">𐒑</div>
            <h1 style="color: #fff; margin: 0; font-size: 24px;">New Business Registration</h1>
        </div>
        
          <div style="background-color: #f9f9f9; border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #D6B98F;">
              <p style="margin-top: 0; font-size: 16px;">A new business has completed the onboarding process and registered for Maamul.</p>
              <p style="margin-bottom: 0;"><strong>Action Required:</strong> Please review and set up their account within 24 hours.</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Business Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Business Name:</strong></td>
                  <td style="padding: 8px 0;">${companyName}</td>
                </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Industry:</strong></td>
                  <td style="padding: 8px 0;">${industry ? (industry === "logistics" ? "Logistics & Distribution" : industry.charAt(0).toUpperCase() + industry.slice(1)) : "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Business Type:</strong></td>
                  <td style="padding: 8px 0;">${businessType || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Location:</strong></td>
                  <td style="padding: 8px 0;">${location || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Business Age:</strong></td>
                  <td style="padding: 8px 0;">${businessAge ? (businessAge === "new" ? "Just starting (0-6 months)" : businessAge === "young" ? "Early stage (6 months - 2 years)" : businessAge === "established" ? "Established (2-5 years)" : businessAge === "mature" ? "Mature (5+ years)" : businessAge) : "Not provided"}</td>
            </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Primary Goal:</strong></td>
                  <td style="padding: 8px 0;">${primaryGoal ? (primaryGoal === "efficiency" ? "Improve operational efficiency" : primaryGoal === "growth" ? "Scale and grow my business" : primaryGoal === "organization" ? "Better organize my business" : primaryGoal === "insights" ? "Get better business insights" : primaryGoal === "automation" ? "Automate manual processes" : primaryGoal) : "Not provided"}</td>
            </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Biggest Challenge:</strong></td>
                  <td style="padding: 8px 0;">${biggestChallenge ? (biggestChallenge === "inventory" ? "Managing inventory levels" : biggestChallenge === "sales" ? "Tracking sales and revenue" : biggestChallenge === "customers" ? "Managing customer relationships" : biggestChallenge === "employees" ? "Coordinating with team members" : biggestChallenge === "reporting" ? "Getting clear business reports" : biggestChallenge === "time" ? "Finding time for strategic work" : biggestChallenge) : "Not provided"}</td>
            </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Daily Hours:</strong></td>
                  <td style="padding: 8px 0;">${dailyHours ? (dailyHours === "part-time" ? "Less than 4 hours" : dailyHours === "half-time" ? "4-6 hours" : dailyHours === "full-time" ? "6-8 hours" : dailyHours === "overtime" ? "More than 8 hours" : dailyHours) : "Not provided"}</td>
            </tr>
          </table>
            </div>

            <div style="margin-bottom: 20px;">
              <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px;">Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Full Name:</strong></td>
                  <td style="padding: 8px 0;">${managerName}</td>
            </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #D6B98F;">${email}</a></td>
            </tr>
            <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0;">${phone || "Not provided"}</td>
            </tr>
          </table>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px;">Team Members</h2>
              <div style="background-color: #fff; padding: 15px; border-radius: 5px;">
                <table style="width: 100%; border-collapse: collapse; border-radius: 5px; overflow: hidden;">
            <thead>
                    <tr style="background-color: #392A17; color: white;">
                      <th style="padding: 10px; text-align: left;">Name</th>
                      <th style="padding: 10px; text-align: left;">Email</th>
                      <th style="padding: 10px; text-align: left;">Role</th>
              </tr>
            </thead>
            <tbody>
              ${teamMembersList}
            </tbody>
          </table>
              </div>
            </div>
            
            ${
              onboardingData
                ? `
                <div style="margin-bottom: 20px;">
                  <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px;">Onboarding Configuration</h2>
                  <div style="background-color: #fff; padding: 15px; border-radius: 5px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      ${
                        onboardingData["company-size"]
                          ? `
                        <tr>
                          <td style="padding: 8px 0; width: 40%;"><strong>Company Size:</strong></td>
                          <td style="padding: 8px 0;">${
                            onboardingData["company-size"] === "micro"
                              ? "Just me (1 person)"
                              : onboardingData["company-size"] === "small"
                                ? "2-5 employees"
                                : onboardingData["company-size"] === "medium"
                                  ? "6-15 employees"
                                  : onboardingData["company-size"] === "large"
                                    ? "16-50 employees"
                                    : onboardingData["company-size"] === "enterprise"
                                      ? "50+ employees"
                                      : onboardingData["company-size"]
                          }</td>
                        </tr>
                      `
                          : ""
                      }
                      ${
                        onboardingData.revenue
                          ? `
                        <tr>
                          <td style="padding: 8px 0; width: 40%;"><strong>Monthly Revenue:</strong></td>
                          <td style="padding: 8px 0;">${
                            onboardingData.revenue === "startup"
                              ? "Just starting out"
                              : onboardingData.revenue === "tier1"
                                ? "Less than $10K"
                                : onboardingData.revenue === "tier2"
                                  ? "$10K - $30K"
                                  : onboardingData.revenue === "tier3"
                                    ? "$30K - $60K"
                                    : onboardingData.revenue === "tier4"
                                      ? "$60K+"
                                      : onboardingData.revenue
                          }</td>
                        </tr>
                      `
                          : ""
                      }
                      ${
                        onboardingData.locations
                          ? `
                        <tr>
                          <td style="padding: 8px 0; width: 40%;"><strong>Number of Locations:</strong></td>
                          <td style="padding: 8px 0;">${onboardingData.locations} location${onboardingData.locations !== 1 ? "s" : ""}</td>
                        </tr>
                      `
                          : ""
                      }
                      ${
                        onboardingData.modules && Array.isArray(onboardingData.modules) && onboardingData.modules.length > 0
                          ? `
                        <tr>
                          <td style="padding: 8px 0; width: 40%; vertical-align: top;"><strong>Selected Modules:</strong></td>
                          <td style="padding: 8px 0;">
                            <ul style="margin: 0; padding-left: 20px;">
                              ${onboardingData.modules
                                .map(
                                  (module: string) => `
                                <li style="margin-bottom: 5px;">${
                                  module === "inventory"
                                    ? "Inventory Management"
                                    : module === "pos"
                                      ? "Point of Sale"
                                      : module === "customers"
                                        ? "Customer Management"
                                        : module === "employees"
                                          ? "Employee Management"
                                          : module === "expenses"
                                            ? "Expense Tracking"
                                            : module === "reporting"
                                              ? "Analytics & Reporting"
                                              : module === "supply"
                                                ? "Supply Chain Management"
                                                : module
                                }</li>
                              `,
                                )
                                .join("")}
                            </ul>
                          </td>
                        </tr>
                      `
                          : ""
                      }
                      ${
                        onboardingData.users
                          ? `
                        <tr>
                          <td style="padding: 8px 0; width: 40%;"><strong>Number of Users:</strong></td>
                          <td style="padding: 8px 0;">${onboardingData.users} user${onboardingData.users !== 1 ? "s" : ""}</td>
                        </tr>
                      `
                          : ""
                      }
                    </table>
                  </div>
                </div>
              `
                : ""
            }
            
            <div style="background-color: #392A17; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-top: 30px;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">Registration submitted on ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
            <p>&copy; 2025 Maamul. All rights reserved.</p>
        </div>
        </body>
        </html>
    `

    // Send email (only if transporter is configured)
    if (transporter) {
      // Send to both user and support
      const recipients = [email, process.env.ADMIN_EMAIL || "support@maamul.com"].filter(Boolean).join(", ")
      
    const mailOptions = {
        from: emailUser,
        to: recipients,
      subject: `New Business Registration: ${companyName}`,
      html: emailHtml,
      replyTo: email,
    }

    try {
      await transporter.sendMail(mailOptions)
        console.log("Registration email sent successfully to:", recipients)
      } catch (error: any) {
      console.error("Failed to send email:", error)
        // Log more details for debugging
        if (error.code) {
          console.error("Email error code:", error.code)
        }
        if (error.response) {
          console.error("Email error response:", error.response)
        }
        if (error.message) {
          console.error("Email error message:", error.message)
        }
      // Don't fail the request if email fails, just log it
        // The user registration is still successful
      }
    } else {
      console.warn("Email not configured - skipping email notification")
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      data: {
        userId: inserted.id,
        companyName,
        email,
        databaseName: databaseName,
        registrationDate: inserted.created_at,
        trialEndDate: trialEndDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 })
  }
}
