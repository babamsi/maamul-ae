# Database Setup Guide for Maamul

This guide will help you set up the MongoDB database integration for the Maamul onboarding system with trial period management and unique database names.

## Prerequisites

- Node.js and npm installed
- MongoDB database (local or cloud)
- MongoDB connection string

## Installation

### 1. Install Dependencies

Run the installation script:
```bash
chmod +x install-deps.sh
./install-deps.sh
```

Or install manually:
```bash
npm install mongoose bcryptjs
npm install --save-dev @types/bcryptjs @types/nodemailer
```

### 2. Environment Configuration

Add your MongoDB connection string and other required environment variables to your `.env` file:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/maamul?retryWrites=true&w=majority

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@maamul.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Job Security
CRON_SECRET=your-secure-cron-secret-key
```

For local MongoDB:
```env
MONGO_URI=mongodb://localhost:27017/maamul
```

## Database Schemas

### User Schema (`lib/models/User.ts`)

**Basic Information:**
- **managerName**: Full name of the business manager
- **companyName**: Name of the company
- **email**: Unique email address (used for login)
- **phone**: Optional phone number
- **location**: Optional business location
- **businessAge**: How long the business has been operating
- **primaryGoal**: Main goal with Maamul
- **biggestChallenge**: Current business challenge
- **dailyHours**: Hours spent on business operations
- **password**: Hashed password
- **industry**: Business industry (retail, wholesale, etc.)
- **onboardingData**: Configuration data from onboarding process
- **teamMembers**: Array of team member information

**Database & Trial Management:**
- **databaseName**: Unique database name for the user (auto-generated)
- **trialStartDate**: When the trial began (auto-set on creation)
- **trialEndDate**: When the trial expires (auto-set to 7 days from creation)
- **isTrialActive**: Whether the trial is currently active
- **subscriptionStatus**: Current status ('trial', 'active', 'expired', 'cancelled')
- **subscriptionPlan**: Paid plan type ('basic', 'professional', 'enterprise')
- **subscriptionStartDate**: When paid subscription started
- **subscriptionEndDate**: When paid subscription expires
- **paymentMethod**: Payment information
- **billingInfo**: Billing address details

**Account Status:**
- **isActive**: Whether the account is active
- **isVerified**: Email verification status

### Waitlist Schema (`lib/models/Waitlist.ts`)
- **name**: Full name of the person
- **email**: Email address
- **company**: Company name
- **industry**: Industry they're interested in
- **isNotified**: Whether they've been notified about availability

## Unique Database Names

### Database Name Generation
Each user gets a unique database name automatically generated from their company name:

**Format**: `maamul_{cleaned-company-name}_{counter-if-needed}`

**Examples**:
- Company: "Test Company" → Database: `maamul_test-company`
- Company: "Another Company" → Database: `maamul_another-company`
- Company: "Test Company" (duplicate) → Database: `maamul_test-company_1`
- Company: "Special@Company#Name!" → Database: `maamul_specialcompanyname`

### Database Name Features
- **Automatic Generation**: Created during user registration
- **Uniqueness Guaranteed**: No duplicate database names
- **Safe Characters**: Special characters removed, spaces converted to hyphens
- **Length Limited**: Maximum 20 characters for base name
- **Prefix Added**: All databases prefixed with "maamul_"
- **Counter System**: Duplicates get numbered suffixes
- **Fallback System**: Timestamp-based names if needed

## Trial System Features

### Automatic Trial Management
- **7-Day Trial**: All new users automatically get a 7-day trial
- **Auto-Expiration**: Trials automatically expire after 7 days
- **Status Updates**: Account status automatically updates on expiration
- **Email Notifications**: Users receive warnings before expiration

### Subscription Plans
- **Basic**: Essential features for small businesses
- **Professional**: Advanced features for growing businesses
- **Enterprise**: Full features for large organizations

### Email Notifications
- **Expiration Warnings**: Sent 24 hours before trial expires
- **Trial Expired**: Sent when trial expires
- **Subscription Activated**: Sent when user upgrades
- **Subscription Cancelled**: Sent when subscription is cancelled

## API Endpoints

### User Management
- **POST** `/api/onboarding/signup` - Create new user with trial and database name
- **POST** `/api/waitlist` - Add to waitlist

### Subscription Management
- **GET** `/api/subscription/status?userId=123` - Get subscription status
- **POST** `/api/subscription/activate` - Activate paid subscription
- **POST** `/api/subscription/cancel` - Cancel subscription

### Database Management
- **GET** `/api/user/database?userId=123` - Get user's database information
- **GET** `/api/admin/databases` - Get all database names (admin)
- **GET** `/api/admin/databases?stats=true` - Get database statistics

### Automated Processes
- **POST** `/api/cron/check-trials` - Check and expire trials (cron job)

## Services

### SubscriptionService (`lib/services/subscriptionService.ts`)
Provides methods for:
- Checking expired trials
- Sending expiration notifications
- Activating subscriptions
- Cancelling subscriptions
- Getting user status
- Sending email notifications

### DatabaseNameService (`lib/services/databaseNameService.ts`)
Provides methods for:
- Generating unique database names
- Validating database name availability
- Getting user database information
- Updating database names
- Getting connection strings
- Database statistics

### Trial Status Middleware (`lib/middleware/trialCheck.ts`)
- Checks trial status on protected routes
- Redirects expired users to upgrade page
- Adds trial status to request headers

## Frontend Integration

### React Hooks
```typescript
// Trial status management
const { status, loading, error, upgradeSubscription, cancelSubscription } = useTrialStatus(userId)

// Database name management
const { databaseInfo, loading, error, refreshDatabaseInfo } = useDatabaseName(userId)
```

### Components
- **TrialStatusBanner** - Displays trial status with remaining days
- **DatabaseInfoCard** - Shows database information and connection string

## Cron Job Setup

Set up a daily cron job to check trial expiration:

```bash
# Add to your crontab (run daily at 2 AM)
0 2 * * * curl -X POST https://your-domain.com/api/cron/check-trials \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

Or use a service like Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-trials",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Database Features

### Security
- **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
- **Email Validation**: Comprehensive email format and domain validation
- **Input Sanitization**: All inputs are trimmed and validated
- **Cron Security**: Protected cron endpoints with secret keys
- **Database Isolation**: Each user gets a unique database name

### Performance
- **Indexes**: Optimized database indexes for common queries
- **Connection Pooling**: Efficient MongoDB connection management
- **Caching**: Connection caching for development
- **Trial Queries**: Fast queries for trial status checks
- **Database Name Index**: Fast lookups by database name

### Data Integrity
- **Required Fields**: Proper validation for required fields
- **Enum Values**: Restricted values for categorical data
- **Unique Constraints**: Email and database name uniqueness enforcement
- **Auto-Expiration**: Automatic trial expiration handling
- **Database Name Uniqueness**: Guaranteed unique database names

## Usage Examples

### Check Trial Status
```javascript
const status = await SubscriptionService.getUserStatus(userId)
console.log(`Remaining trial days: ${status.remainingTrialDays}`)
```

### Generate Database Name
```javascript
const databaseName = await User.generateUniqueDatabaseName('My Company')
console.log(`Generated database name: ${databaseName}`)
```

### Get Database Information
```javascript
const databaseInfo = await DatabaseNameService.getUserDatabaseName(userId)
const connectionString = await DatabaseNameService.getDatabaseConnectionString(userId)
```

### Activate Subscription
```javascript
await SubscriptionService.activateSubscription(userId, 'basic', 30)
```

### Find Expired Trials
```javascript
const expiredTrials = await User.findExpiredTrials()
```

### Send Expiration Notifications
```javascript
await SubscriptionService.sendExpirationNotifications()
```

## Testing the System

### Run the Test Script
```bash
node scripts/test-trial-system.js
```

### Test User Registration
1. Complete the onboarding process
2. Check that user is created successfully
3. Verify trial information in response
4. Check database for proper trial fields and database name

### Expected Response
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "userId": "...",
    "companyName": "Mamul",
    "email": "bamci@maamul.com",
    "databaseName": "maamul_mamul",
    "registrationDate": "2024-01-01T00:00:00.000Z",
    "trialEndDate": "2024-01-08T00:00:00.000Z",
    "remainingTrialDays": 7
  }
}
```

## Trial System Features Now Working

✅ **7-Day Trial**: Automatic trial period for new users  
✅ **Auto-Expiration**: Trials expire after 7 days  
✅ **Status Tracking**: Real-time trial status monitoring  
✅ **Email Notifications**: Automated warning and expiration emails  
✅ **Subscription Management**: Activate/cancel subscriptions  
✅ **Database Integration**: Proper MongoDB storage and queries  
✅ **Unique Database Names**: Automatic generation for each user  
✅ **API Endpoints**: Complete subscription and database management APIs  
✅ **Frontend Components**: Trial status banners and database info cards  

## Next Steps

1. **Install Dependencies**: Run `./install-deps.sh`
2. **Configure Environment**: Set up `.env` with MongoDB and email settings
3. **Test Registration**: Try the signup process again
4. **Set Up Cron Jobs**: Configure automated trial expiration checks
5. **Monitor Logs**: Check for any remaining issues
6. **Database Management**: Use the admin endpoints to monitor database usage

The trial system with unique database names is now fully functional and ready for production use! 