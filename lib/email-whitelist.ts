// Email domain whitelist configuration
const WHITELISTED_DOMAINS = [
  // Common email providers for testing
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",

  // Business domains (add your client domains here)
  "maamul.com",
  "company.com",
  "business.co",

  // Add more domains as needed
]

// Additional whitelisted full email addresses
const WHITELISTED_EMAILS = [
  "admin@example.com",
  "test@demo.com",
  // Add specific email addresses here
]

// Check if email domain is whitelisted
export function isEmailWhitelisted(email: string): boolean {
  // In development mode, allow all emails
  if (process.env.NODE_ENV === "development") {
    return true
  }

  const emailLower = email.toLowerCase()

  // Check if the full email is whitelisted
  if (WHITELISTED_EMAILS.includes(emailLower)) {
    return true
  }

  // Extract domain from email
  const domain = emailLower.split("@")[1]

  // Check if domain is whitelisted
  return WHITELISTED_DOMAINS.includes(domain)
}

// Add domain to whitelist (for admin use)
export function addDomainToWhitelist(domain: string): void {
  if (!WHITELISTED_DOMAINS.includes(domain.toLowerCase())) {
    WHITELISTED_DOMAINS.push(domain.toLowerCase())
  }
}

// Add email to whitelist (for admin use)
export function addEmailToWhitelist(email: string): void {
  if (!WHITELISTED_EMAILS.includes(email.toLowerCase())) {
    WHITELISTED_EMAILS.push(email.toLowerCase())
  }
}

// Remove domain from whitelist (for admin use)
export function removeDomainFromWhitelist(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim()
  const index = WHITELISTED_DOMAINS.indexOf(cleanDomain)
  if (index > -1) {
    WHITELISTED_DOMAINS.splice(index, 1)
    return true
  }
  return false
}

// Get all whitelisted domains
export function getWhitelistedDomains(): string[] {
  return [...WHITELISTED_DOMAINS]
}

// Get all whitelisted emails
export function getWhitelistedEmails(): string[] {
  return [...WHITELISTED_EMAILS]
}
