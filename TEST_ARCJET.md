# Testing Arcjet Integration

## Current Status

✅ **Arcjet is integrated** into the signup endpoint (`/app/api/onboarding/signup`)
✅ **Test endpoint created** at `/app/api/test-arcjet`
✅ **Test script created** at `scripts/test-arcjet.js`

## Test Results

Based on the test run:
- ❌ **ARCJET_KEY is not set** - Arcjet will not work until you add your API key

## How to Test Arcjet

### Step 1: Get Your Arcjet API Key

1. Sign up at [https://arcjet.com](https://arcjet.com)
2. Create a new site/project
3. Copy your API key from the dashboard

### Step 2: Add API Key to Environment

Create or update `.env.local` file in the project root:

```env
ARCJET_KEY=ajkey_your_actual_key_here
```

### Step 3: Restart Your Development Server

```bash
npm run dev
```

### Step 4: Test Arcjet Configuration

#### Option A: Use the Test Script

```bash
node scripts/test-arcjet.js
```

This will check if:
- ARCJET_KEY is set
- The key is valid length
- Arcjet package is installed

#### Option B: Use the Test API Endpoint

1. Start your dev server: `npm run dev`
2. Visit in browser or use curl:

```bash
# Basic test
curl http://localhost:3000/api/test-arcjet

# Test with email
curl http://localhost:3000/api/test-arcjet?email=test@example.com

# Test with disposable email (should be blocked)
curl http://localhost:3000/api/test-arcjet?email=test@tempmail.com

# Test POST request
curl -X POST http://localhost:3000/api/test-arcjet \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

#### Option C: Test the Actual Signup Endpoint

Test the protected signup endpoint:

```bash
# Valid signup (should work)
curl -X POST http://localhost:3000/api/onboarding/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "industry": "retail",
    "email": "valid@example.com",
    "managerName": "Test User",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'

# Disposable email (should be blocked by Arcjet)
curl -X POST http://localhost:3000/api/onboarding/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "industry": "retail",
    "email": "test@tempmail.com",
    "managerName": "Test User",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'

# Invalid email format (should be blocked by Arcjet)
curl -X POST http://localhost:3000/api/onboarding/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "industry": "retail",
    "email": "invalid-email",
    "managerName": "Test User",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

## Expected Behavior

### ✅ When Arcjet is Working:

1. **Valid Email**: Request proceeds normally
2. **Disposable Email**: Returns 400 with "Email validation failed"
3. **Invalid Email**: Returns 400 with "Email validation failed"
4. **Bot Request**: Returns 403 with "Automated requests are not allowed"
5. **Rate Limit**: Returns 429 with "Too many signup attempts" (after 5 requests/hour)

### ❌ When ARCJET_KEY is Missing:

- Arcjet will not block any requests
- All validation will pass (but basic email regex still works)
- No error messages, but protection is inactive

## Monitoring

Check the Arcjet Dashboard at [https://app.arcjet.com](https://app.arcjet.com) to see:
- Blocked requests
- Rate limit hits
- Bot detection results
- Email validation results

## Troubleshooting

### Issue: "ARCJET_KEY is not set"
**Solution**: Add `ARCJET_KEY=your_key` to `.env.local` and restart server

### Issue: "Request blocked" but should be allowed
**Solution**: Check Arcjet dashboard for details, may need to adjust rules

### Issue: Arcjet not blocking disposable emails
**Solution**: Verify `denyDisposable: true` in `lib/arcjet.ts` configuration

### Issue: Rate limit not working
**Solution**: Check rate limit configuration in `lib/arcjet.ts` (currently 5/hour)

## Next Steps

1. ✅ Get your Arcjet API key
2. ✅ Add to `.env.local`
3. ✅ Restart dev server
4. ✅ Run test script: `node scripts/test-arcjet.js`
5. ✅ Test with API endpoint: `curl http://localhost:3000/api/test-arcjet`
6. ✅ Test actual signup endpoint with various email types
7. ✅ Monitor Arcjet dashboard for activity




