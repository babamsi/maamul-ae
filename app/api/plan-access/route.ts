import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Currency conversion rate
const USD_TO_KES = 129

// Currency conversion helper functions
function convertPrice(usdPrice: number, currency: string = "USD"): number {
  if (currency === "KES") {
    return Math.round(usdPrice * USD_TO_KES)
  }
  return usdPrice
}

function formatPrice(price: number, currency: string = "USD"): string {
  const convertedPrice = convertPrice(price, currency)
  if (currency === "KES") {
    return convertedPrice.toLocaleString("en-KE")
  }
  return convertedPrice.toLocaleString()
}

function getCurrencySymbol(currency: string = "USD"): string {
  return currency === "KES" ? "KES" : "$"
}

// Configure email transporter settings
const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com"
const emailPort = Number.parseInt(process.env.EMAIL_PORT || "587")
const emailUser = process.env.EMAIL_USER
const emailPass = process.env.EMAIL_PASS

// Create transporter lazily (only when needed) to avoid DNS resolution issues at module load
function createTransporter() {
  if (!emailUser || !emailPass) {
    return null
  }
  
  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      // Do not fail on invalid certs (helps with DNS resolution issues)
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 15000, // 15 seconds
    socketTimeout: 30000, // 30 seconds
    // Don't use connection pooling in serverless environments
    pool: false,
    // Disable DNS lookup caching to avoid EBUSY errors
    dns: {
      lookup: undefined,
    },
  })
}

// Helper function to get tier display name
function getTierDisplayName(tier: string): string {
  const tierNames = {
    tier1: "Starter",
    tier2: "Growth",
    tier3: "Professional",
    tier4: "Business",
    tier5: "Enterprise S",
    tier6: "Enterprise M",
    tier7: "Enterprise L",
    tier8: "Enterprise XL",
  }
  return tierNames[tier as keyof typeof tierNames] || tier
}

// Helper function to format integration fees
function formatIntegrationFees(integrationFees: any[], currency: string = "USD"): { html: string; total: number } {
  console.log("Integration fees received:", integrationFees) // Debug log

  if (!integrationFees || integrationFees.length === 0) {
    return { html: "", total: 0 }
  }

  const currencySymbol = getCurrencySymbol(currency)
  let total = 0
  const html = integrationFees
    .map((fee) => {
      total += fee.price
      return `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${fee.name}</td>
        <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(fee.price, currency)}</td>
      </tr>
    `
    })
    .join("")

  return { html, total }
}

export async function POST(request: Request) {
  try {
    // Check if email configuration is available
    if (!emailUser || !emailPass) {
      console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set")
      // Still return success but log the issue - don't fail the request
      console.warn("Plan access request received but email service is not configured")
    }

    const formData = await request.json()

    // Debug log to see the complete form data structure
    console.log("Complete form data:", JSON.stringify(formData, null, 2))

    // Validate required fields
    if (!formData.businessName || !formData.contactName || !formData.email) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, contactName, or email" },
        { status: 400 },
      )
    }

    // Format plan data for email
    const planData = formData.planData
      ? Object.entries(formData.planData)
          .filter(
            ([key]) =>
              ![
                "integrationFees",
                "recommendedPlan",
                "monthlyPrice",
                "annualPrice",
                "billingPreference",
                "oneTimeCost",
              ].includes(key),
          )
          .map(([key, value]) => {
            // Format keys for better readability
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/([a-z])([A-Z])/g, "$1 $2")

            return `<li><strong>${formattedKey}:</strong> ${value}</li>`
          })
          .join("")
      : ""

    // Get plan name for subject line
    const planName =
      formData.planData && formData.planData.recommendedPlan
        ? getTierDisplayName(formData.planData.recommendedPlan)
        : "Enterprise Plan"

    // Get currency from planData (default to USD if not set)
    const currency = formData.planData?.currency || "USD"
    const currencySymbol = getCurrencySymbol(currency)

    // Check multiple possible locations for integration data
    let integrationFeesArray = []

    // Check if integrationFees is in planData
    if (formData.planData?.integrationFees && Array.isArray(formData.planData.integrationFees)) {
      integrationFeesArray = formData.planData.integrationFees
    }
    // Check if integrationFees is at root level
    else if (formData.integrationFees && Array.isArray(formData.integrationFees)) {
      integrationFeesArray = formData.integrationFees
    }
    // Check if oneTimeCost exists and convert it
    else if (formData.planData?.oneTimeCost && formData.planData.oneTimeCost > 0) {
      integrationFeesArray = [
        {
          name: "Custom Integration Package",
          price: formData.planData.oneTimeCost,
        },
      ]
    }

    console.log("Final integration fees array:", integrationFeesArray) // Debug log

    const integrationFeesData = formatIntegrationFees(integrationFeesArray, currency)
    const hasIntegrations = integrationFeesArray.length > 0 && integrationFeesData.total > 0

    console.log("Has integrations:", hasIntegrations, "Total:", integrationFeesData.total) // Debug log

    // Email to admin
    const adminMailOptions = {
      from: "no-reply@maamul.com",
      to: "support@maamul.com",
      subject: `New Enterprise Plan Request: ${planName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Enterprise Plan Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #392A17; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <div style="font-size: 60px; color: #D6B98F; margin-bottom: 15px; text-align: center;">𐒑</div>
            <h1 style="color: #fff; margin: 0; font-size: 24px;">New Enterprise Plan Request</h1>
          </div>
          
          <div style="background-color: #f9f9f9; border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #D6B98F;">
              <p style="margin-top: 0; font-size: 16px;">A customer has requested access to the <strong>${planName}</strong> plan.</p>
              <p style="margin-bottom: 0;"><strong>Action Required:</strong> Please contact this customer within 24 hours.</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Business Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Business Name:</strong></td>
                  <td style="padding: 8px 0;">${formData.businessName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Contact Name:</strong></td>
                  <td style="padding: 8px 0;">${formData.contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${formData.email}" style="color: #D6B98F;">${formData.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0;">${formData.phone || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Industry:</strong></td>
                  <td style="padding: 8px 0;">${formData.industry ? (formData.industry === "logistics" ? "Logistics & Distribution" : formData.industry.charAt(0).toUpperCase() + formData.industry.slice(1)) : "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Business Size:</strong></td>
                  <td style="padding: 8px 0;">${formData.businessSize || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Implementation Timeline:</strong></td>
                  <td style="padding: 8px 0;">${
                    formData.implementationTimeline
                      ? formData.implementationTimeline === "immediate"
                        ? "Immediate (1-2 weeks)"
                        : formData.implementationTimeline === "1-3months"
                          ? "1-3 months"
                          : formData.implementationTimeline === "3-6months"
                            ? "3-6 months"
                            : "6+ months"
                      : "Not provided"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Payment Preference:</strong></td>
                  <td style="padding: 8px 0;">${
                    formData.paymentPreference
                      ? formData.paymentPreference === "quarterly"
                        ? "Quarterly Billing"
                        : formData.paymentPreference === "annual"
                          ? "Annual Billing (Save 15%)"
                          : "Quarterly Billing"
                      : "Not provided"
                  }</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px;">Additional Requirements</h2>
              <p style="background-color: #fff; padding: 10px; border-radius: 5px; margin-top: 10px;">${formData.additionalRequirements || "None provided"}</p>
            </div>
            
            ${
              formData.planData && formData.planData.recommendedPlan
                ? `
    <div style="margin-bottom: 20px; background-color: #f5f0e8; padding: 15px; border-radius: 5px;">
      <h2 style="color: #392A17; border-bottom: 1px solid #e0d5c0; padding-bottom: 10px; margin-top: 0;">Plan & Pricing Details</h2>
      
      <!-- Subscription Plan Details -->
      <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
        <h3 style="color: #392A17; margin-top: 0; margin-bottom: 10px; font-size: 16px;">Subscription Plan</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 40%;"><strong>Plan:</strong></td>
            <td style="padding: 8px 0;">${planName}</td>
          </tr>
          ${
            formData.planData.monthlyPrice
              ? `
          <tr>
            <td style="padding: 8px 0; width: 40%;"><strong>Quarterly Price:</strong></td>
            <td style="padding: 8px 0;">${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(formData.planData.monthlyPrice, currency)}</td>
          </tr>
          `
              : ""
          }
          ${
            formData.planData.annualPrice
              ? `
          <tr>
            <td style="padding: 8px 0; width: 40%;"><strong>Annual Price:</strong></td>
            <td style="padding: 8px 0;">${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(formData.planData.annualPrice, currency)}</td>
          </tr>
          `
              : ""
          }
          ${
            formData.planData.billingPreference
              ? `
          <tr>
            <td style="padding: 8px 0; width: 40%;"><strong>Billing Preference:</strong></td>
            <td style="padding: 8px 0;">${formData.planData.billingPreference}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>
      
      <!-- Integration Services Section -->
      <div style="background-color: #fff; padding: 15px; border-radius: 5px;">
        <h3 style="color: #392A17; margin-top: 0; margin-bottom: 10px; font-size: 16px;">Integration Services</h3>
        ${
          hasIntegrations
            ? `
          <table style="width: 100%; border-collapse: collapse; border-radius: 5px; overflow: hidden;">
            <thead>
              <tr style="background-color: #392A17; color: white;">
                <th style="padding: 10px; text-align: left;">Integration Service</th>
                <th style="padding: 10px; text-align: right;">One-Time Fee</th>
              </tr>
            </thead>
            <tbody>
              ${integrationFeesData.html}
              <tr style="background-color: #f5f0e8; font-weight: bold;">
                <td style="padding: 12px; border-top: 2px solid #D6B98F;">Total One-Time Integration Fees</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #D6B98F;">${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(integrationFeesData.total, currency)}</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
            * All integration services include business-specific customization and data migration tailored to customer needs.
          </p>
        `
            : `
          <div style="text-align: center; color: #777; padding: 20px; background-color: #f8f9fa; border-radius: 5px; border: 1px dashed #ddd;">
            <p style="margin: 0; font-style: italic;">No integration services selected</p>
          </div>
        `
        }
      </div>
    </div>
  `
                : ""
            }
            
            ${
              planData
                ? `
                <div style="margin-bottom: 20px;">
                  <h2 style="color: #392A17; border-bottom: 1px solid #eee; padding-bottom: 10px;">Questionnaire Information</h2>
                  <div style="background-color: #fff; padding: 15px; border-radius: 5px;">
                    <ul style="margin: 0; padding-left: 20px;">
                      ${planData}
                    </ul>
                  </div>
                </div>
              `
                : ""
            }
            
            <div style="background-color: #392A17; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-top: 30px;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #777; font-size: 12px;">
            <p>&copy; 2026 Maamul. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    }

    // Email to user
    const userMailOptions = {
      from: "no-reply@maamul.com",
      to: formData.email,
      subject: `Your Maamul ${planName} Request`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Enterprise Plan Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #392A17;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .logo {
          font-size: 60px;
          color: #D6B98F;
          margin-bottom: 15px;
        }
        .content {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-top: none;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .greeting {
          background-color: #f5f0e8;
          border-left: 4px solid #D6B98F;
          padding: 15px;
          margin-bottom: 20px;
        }
        .plan-details {
          background-color: #fff;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .feature-list {
          padding-left: 20px;
        }
        .feature-item {
          margin-bottom: 8px;
          position: relative;
          padding-left: 25px;
        }
        .feature-item:before {
          content: "✓";
          color: #D6B98F;
          position: absolute;
          left: 0;
        }
        .next-steps {
          margin-bottom: 20px;
        }
        .next-steps ol {
          padding-left: 20px;
        }
        .next-steps li {
          margin-bottom: 10px;
        }
        .meeting-info {
          background-color: rgba(57, 42, 23, 0.05);
          padding: 15px;
          border-radius: 5px;
          border: 1px solid rgba(57, 42, 23, 0.1);
          margin-bottom: 20px;
        }
        .contact-box {
          background-color: #392A17;
          color: white;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          margin-top: 30px;
        }
        .contact-box a {
          color: #D6B98F;
          text-decoration: underline;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #777;
          font-size: 12px;
        }
        h1 {
          color: #fff;
          margin: 0;
          font-size: 24px;
        }
        h2 {
          color: #392A17;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-top: 0;
        }
        .price {
          font-size: 24px;
          font-weight: bold;
          color: #392A17;
        }
        .price-note {
          font-size: 14px;
          color: #777;
        }
        .integration-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          background-color: #fff;
          border-radius: 5px;
          overflow: hidden;
        }
        .integration-table th {
          background-color: #392A17;
          color: white;
          padding: 10px;
          text-align: left;
        }
        .integration-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
        }
        .integration-total {
          background-color: #f5f0e8;
          font-weight: bold;
          border-top: 2px solid #D6B98F;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">𐒑</div>
          <h1>Thank You for Your Interest!</h1>
          <p style="color: #D6B98F; margin: 10px 0 0 0;">We've received your request for the ${planName}</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p style="margin: 0; font-size: 16px;">Dear ${formData.contactName},</p>
            <p style="margin-top: 10px;">Thank you for your interest in Maamul's ${planName}. We're excited about the possibility of helping your business streamline its operations.</p>
          </div>
          
          <div class="plan-details">
            <h2>Your Selected Plan & Services</h2>
            
            <!-- Subscription Plan Section -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 3px solid #D6B98F;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                  <p style="font-weight: bold; font-size: 18px; margin: 0; color: #392A17;">${planName}</p>
                  <p style="color: #777; font-size: 14px; margin: 5px 0 0 0;">Monthly Subscription Plan</p>
                </div>
                ${
                  formData.planData?.monthlyPrice || formData.planData?.annualPrice
                    ? `
                <div style="text-align: right;">
                  <div class="price">${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(
                    formData.planData.billingPreference === "annual"
                      ? Math.round(formData.planData.annualPrice / 12)
                      : formData.planData.monthlyPrice,
                    currency
                  )}/mo</div>
                  <div class="price-note">
                    ${
                      formData.planData.billingPreference === "annual"
                        ? `${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(formData.planData.annualPrice, currency)} billed annually`
                        : `Billed quarterly`
                    }
                  </div>
                </div>
                `
                    : ""
                }
              </div>
              
              <h3 style="margin-bottom: 10px; color: #392A17;">Included Features:</h3>
              <div class="feature-list">
                ${
                  formData.planData?.recommendedPlan === "tier5"
                    ? `
                    <div class="feature-item">Advanced inventory management</div>
                    <div class="feature-item">Advanced supply chain management</div>
                    <div class="feature-item">Custom integrations</div>
                    <div class="feature-item">Advanced security features</div>
                    <div class="feature-item">Up to 25 user accounts</div>
                    `
                    : formData.planData?.recommendedPlan === "tier6"
                      ? `
                    <div class="feature-item">Multi-location support (up to 25 locations)</div>
                    <div class="feature-item">Advanced analytics with AI-powered insights</div>
                    <div class="feature-item">Advanced API access</div>
                    <div class="feature-item">Custom development</div>
                    <div class="feature-item">Up to 50 user accounts</div>
                    `
                      : formData.planData?.recommendedPlan === "tier7"
                        ? `
                    <div class="feature-item">Global operations support</div>
                    <div class="feature-item">Enterprise-grade security</div>
                    <div class="feature-item">Dedicated development team</div>
                    <div class="feature-item">Custom workflows</div>
                    <div class="feature-item">Unlimited user accounts</div>
                    `
                        : formData.planData?.recommendedPlan === "tier8"
                          ? `
                    <div class="feature-item">Unlimited everything</div>
                    <div class="feature-item">Custom infrastructure</div>
                    <div class="feature-item">White-glove onboarding</div>
                    <div class="feature-item">Executive support line</div>
                    <div class="feature-item">Strategic partnership</div>
                    `
                          : `
                    <div class="feature-item">Advanced inventory management</div>
                    <div class="feature-item">Multi-location support</div>
                    <div class="feature-item">Advanced analytics</div>
                    <div class="feature-item">Priority support</div>
                    `
                }
              </div>
            </div>
            
            <!-- Integration Services Section -->
            ${
              hasIntegrations
                ? `
              <div style="background-color: #fff; border: 2px solid #D6B98F; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #392A17; margin-top: 0; margin-bottom: 15px;">Selected Integration Services</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">One-time customization setup and data migration services tailored to your business:</p>
                
                <table class="integration-table">
                  <thead>
                    <tr>
                      <th>Integration Service</th>
                      <th style="text-align: right;">One-Time Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${integrationFeesData.html}
                    <tr class="integration-total">
                      <td><strong>Total Integration Investment</strong></td>
                      <td style="text-align: right;"><strong>${currencySymbol === "KES" ? "KES " : "$"}${formatPrice(integrationFeesData.total, currency)}</strong></td>
                    </tr>
                  </tbody>
                </table>
                <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
                  * Note: all integration services include business-specific customization and data migration solutions tailored to your unique business requirements.
                </p>
              </div>
            `
                : `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; border: 1px dashed #ddd;">
                <p style="margin: 0; color: #777; font-style: italic;">No additional integration services selected</p>
              </div>
            `
            }
          </div>
          
          <div class="next-steps">
            <h2>Next Steps</h2>
            <ol>
              <li>Our maamul team will review your request within 24 hours.</li>
              <li>A dedicated account manager will contact you to discuss your specific requirements.</li>
              <li>We'll provide a customized demo tailored to your business needs.</li>
              <li>Together, we'll finalize your implementation plan and timeline.</li>
            </ol>
          </div>
          
          ${
            formData.implementationTimeline
              ? `
              <div class="meeting-info">
                <p style="font-weight: bold; color: #392A17; margin-top: 0;">Implementation Timeline:</p>
                <p style="margin-bottom: 0;">Based on your preferences, we've noted your desired implementation timeline of <strong>${
                  formData.implementationTimeline === "immediate"
                    ? "Immediate (1-2 weeks)"
                    : formData.implementationTimeline === "1-3months"
                      ? "1-3 months"
                      : formData.implementationTimeline === "3-6months"
                        ? "3-6 months"
                        : "6+ months"
                }</strong>.</p>
              </div>
              `
              : ""
          }
          
          <div class="contact-box">
            <p style="margin: 0; font-size: 16px;">Have questions? Contact us at <a href="mailto:support@maamul.com">support@maamul.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 Maamul. All rights reserved.</p>
          <p>This email was sent to you because you requested information about our enterprise plans for Maamul.</p>
        </div>
      </div>
    </body>
    </html>
  `,
    }

    // Send emails - create transporter only when needed
    const transporter = createTransporter()
    
    if (transporter) {
      try {
        // Send both emails
        await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(userMailOptions),
        ])
        console.log("Plan access emails sent successfully")
      } catch (emailError) {
        // Log error but don't fail the request - email is not critical
        console.error("Failed to send plan access emails:", emailError)
        // Continue to return success even if email fails
      }
    } else {
      console.warn("Email service not configured - skipping email notifications")
    }

    return NextResponse.json({
      success: true,
      message: "Your plan request has been submitted successfully. Our Maamul Team will contact you shortly.",
    })
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to submit request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
