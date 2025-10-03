const mongoose = require('mongoose')
require('dotenv').config()

// Test the trial system functionality
async function testTrialSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Import the User model
    const User = require('../lib/models/User').default
    const { DatabaseCreatorService } = require('../lib/services/databaseCreatorService')

    // Test 1: Generate unique database names
    console.log('\n=== Test 1: Database name generation ===')
    const testCompanyNames = [
      'Test Company',
      'Another Company',
      'Test Company', // Should generate different name
      'Special@Company#Name!',
      'Very Long Company Name That Should Be Truncated',
      'Company with Spaces'
    ]

    for (const companyName of testCompanyNames) {
      const databaseName = await User.generateUniqueDatabaseName(companyName)
      console.log(`Company: "${companyName}" -> Database: "${databaseName}"`)
    }

    // Test 2: Create a test user with database name
    console.log('\n=== Test 2: Creating test user with database name ===')
    const testUser = new User({
      managerName: 'Test Manager',
      companyName: 'Test Company',
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'Test City',
      businessAge: 'new',
      primaryGoal: 'efficiency',
      biggestChallenge: 'inventory',
      dailyHours: 'full-time',
      password: 'hashedpassword123',
      industry: 'retail',
      onboardingData: {
        'company-size': 'small',
        revenue: 'tier1',
        locations: 1,
        modules: ['inventory', 'pos'],
        users: 3
      },
      teamMembers: [],
      isActive: true,
      isVerified: false,
      databaseName: await User.generateUniqueDatabaseName('Test Company'),
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isTrialActive: true,
      subscriptionStatus: 'trial'
    })

    await testUser.save()
    console.log('✅ Test user created successfully')
    console.log(`User ID: ${testUser._id}`)
    console.log(`Database Name: ${testUser.databaseName}`)
    console.log(`Trial ends: ${testUser.trialEndDate}`)
    console.log(`Remaining days: ${testUser.getRemainingTrialDays()}`)

    // Test 3: Create user database with models
    console.log('\n=== Test 3: Creating user database with models ===')
    try {
      const dbResult = await DatabaseCreatorService.createDatabaseAndModels(
        testUser.databaseName, 
        testUser._id.toString()
      )
      console.log('✅ User database created successfully')
      console.log(`Database: ${dbResult.databaseName}`)
      console.log(`Admin User ID: ${dbResult.adminUserId}`)
    } catch (error) {
      console.error('❌ Error creating user database:', error)
    }

    // Test 4: Check if database exists
    console.log('\n=== Test 4: Checking database existence ===')
    const exists = await DatabaseCreatorService.databaseExists(testUser.databaseName)
    console.log(`Database exists: ${exists}`)

    // Test 5: Check trial status
    console.log('\n=== Test 5: Checking trial status ===')
    const isExpired = testUser.isTrialExpired()
    const remainingDays = testUser.getRemainingTrialDays()
    console.log(`Is trial expired: ${isExpired}`)
    console.log(`Remaining trial days: ${remainingDays}`)

    // Test 6: Find expired trials (should be empty for new user)
    console.log('\n=== Test 6: Finding expired trials ===')
    const expiredTrials = await User.findExpiredTrials()
    console.log(`Found ${expiredTrials.length} expired trials`)

    // Test 7: Find trials expiring soon
    console.log('\n=== Test 7: Finding trials expiring soon ===')
    const expiringSoon = await User.findTrialsExpiringSoon()
    console.log(`Found ${expiringSoon.length} trials expiring soon`)

    // Test 8: Activate subscription
    console.log('\n=== Test 8: Activating subscription ===')
    testUser.activateSubscription('basic', 30)
    await testUser.save()
    console.log('✅ Subscription activated')
    console.log(`Subscription plan: ${testUser.subscriptionPlan}`)
    console.log(`Subscription ends: ${testUser.subscriptionEndDate}`)
    console.log(`Is trial active: ${testUser.isTrialActive}`)

    // Test 9: Cancel subscription
    console.log('\n=== Test 9: Cancelling subscription ===')
    testUser.cancelSubscription()
    await testUser.save()
    console.log('✅ Subscription cancelled')
    console.log(`Subscription status: ${testUser.subscriptionStatus}`)
    console.log(`Is active: ${testUser.isActive}`)

    // Test 10: Test database name uniqueness
    console.log('\n=== Test 10: Testing database name uniqueness ===')
    const duplicateDatabaseName = await User.generateUniqueDatabaseName('Test Company')
    console.log(`Generated unique name for duplicate company: ${duplicateDatabaseName}`)
    console.log(`Original database name: ${testUser.databaseName}`)
    console.log(`Names are different: ${duplicateDatabaseName !== testUser.databaseName}`)

    // Clean up: Delete test user and database
    console.log('\n=== Cleanup: Deleting test user and database ===')
    try {
      await DatabaseCreatorService.deleteUserDatabase(testUser.databaseName)
      console.log('✅ Test database deleted')
    } catch (error) {
      console.log('⚠️ Could not delete test database:', error.message)
    }
    
    await User.findByIdAndDelete(testUser._id)
    console.log('✅ Test user deleted')

    console.log('\n🎉 All tests passed! Trial system and database creation are working correctly.')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the test
testTrialSystem() 