# Arcjet Setup Guide

This project uses [Arcjet](https://arcjet.com) for bot protection and email validation on the signup endpoint.

## Features

- **Bot Detection**: Blocks automated bots and AI scrapers
- **Email Validation**: Validates email addresses, blocks disposable emails, and checks for MX records
- **Rate Limiting**: Limits signup attempts to 5 per hour per IP address

## Setup Instructions

### 1. Get Your Arcjet API Key

1. Sign up for a free account at [arcjet.com](https://arcjet.com)
2. Create a new site/project
3. Copy your API key from the dashboard

### 2. Add Environment Variable

Add your Arcjet API key to your `.env.local` file (or your deployment environment variables):

```env
ARCJET_KEY=your_arcjet_api_key_here
```

### 3. Configuration

The Arcjet configuration is located in `lib/arcjet.ts`. The current settings are:

- **Mode**: 
  - `DRY_RUN` in development (logs but doesn't block)
  - `LIVE` in production (enforces all rules)

- **Bot Protection**:
  - Allows: Search engine bots
  - Blocks: AI scrapers and automated bots

- **Email Validation**:
  - Blocks disposable email addresses
  - Blocks invalid email formats
  - Blocks emails without MX records

- **Rate Limiting**:
  - Window: 1 hour (3600 seconds)
  - Max requests: 5 signups per hour per IP

### 4. Testing

In development mode (`NODE_ENV !== "production"`), Arcjet runs in `DRY_RUN` mode, which means:
- It logs all protection decisions
- It doesn't actually block requests
- You can see what would be blocked in the Arcjet dashboard

To test blocking behavior, temporarily change the mode to `"LIVE"` in `lib/arcjet.ts`.

### 5. Monitoring

Monitor your Arcjet protection in the [Arcjet Dashboard](https://app.arcjet.com):
- View blocked requests
- See rate limit hits
- Monitor bot detection
- Review email validation results

## Implementation Details

The Arcjet protection is integrated into `/app/api/onboarding/signup/route.ts`:

1. **Request Protection**: Every signup request is checked for bots and rate limits
2. **Email Validation**: The email address is validated before processing
3. **Error Handling**: Specific error messages are returned for different denial reasons

## Customization

You can customize the protection rules in `lib/arcjet.ts`:

- Adjust rate limits (window and max requests)
- Modify bot allow/deny lists
- Change email validation rules
- Add additional protection rules

For more information, see the [Arcjet Documentation](https://docs.arcjet.com).




