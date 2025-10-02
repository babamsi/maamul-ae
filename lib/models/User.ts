import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  managerName: string
  companyName: string
  email: string
  phone?: string
  location?: string
  businessAge?: string
  primaryGoal?: string
  biggestChallenge?: string
  dailyHours?: string
  password: string
  industry: string
  onboardingData: {
    'company-size'?: string
    revenue?: string
    locations?: number
    modules?: string[]
    users?: number
  }
  teamMembers: Array<{
    name: string
    email: string
    role: string
  }>
  isActive: boolean
  isVerified: boolean
  // Database and trial fields
  databaseName: string
  trialStartDate: Date
  trialEndDate: Date
  isTrialActive: boolean
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  subscriptionPlan?: string
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  paymentMethod?: {
    type: string
    last4?: string
    expiryDate?: string
  }
  billingInfo?: {
    address: string
    city: string
    country: string
    postalCode: string
  }
  createdAt: Date
  updatedAt: Date
}

// Define interface for static methods
interface UserModel extends mongoose.Model<IUser> {
  findExpiredTrials(): Promise<IUser[]>
  findTrialsExpiringSoon(): Promise<IUser[]>
  generateUniqueDatabaseName(companyName: string, userId?: string): Promise<string>
}

const UserSchema: Schema = new Schema({
  managerName: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  businessAge: {
    type: String,
    enum: ['new', 'young', 'established', 'mature']
  },
  primaryGoal: {
    type: String,
    enum: ['efficiency', 'growth', 'organization', 'insights', 'automation']
  },
  biggestChallenge: {
    type: String,
    enum: ['inventory', 'sales', 'customers', 'employees', 'reporting', 'time']
  },
  dailyHours: {
    type: String,
    enum: ['part-time', 'half-time', 'full-time', 'overtime']
  },
  password: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['retail', 'wholesale', 'manufacturing', 'logistics', 'hospitality', 'healthcare', 'agriculture']
  },
  onboardingData: {
    'company-size': {
      type: String,
      enum: ['micro', 'small', 'medium', 'large', 'enterprise']
    },
    revenue: {
      type: String,
      enum: ['startup', 'tier1', 'tier2', 'tier3', 'tier4']
    },
    locations: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    modules: [{
      type: String,
      enum: ['inventory', 'pos', 'customers', 'employees', 'expenses', 'reporting', 'supply']
    }],
    users: {
      type: Number,
      min: 1,
      max: 20,
      default: 2
    }
  },
  teamMembers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['Employee', 'Manager', 'Cashier'],
      default: 'Employee'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Database and trial fields
  databaseName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    required: false
  },
  isTrialActive: {
    type: Boolean,
    default: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial'
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'professional', 'enterprise'],
    required: false
  },
  subscriptionStartDate: {
    type: Date,
    required: false
  },
  subscriptionEndDate: {
    type: Date,
    required: false
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'mobile_money']
    },
    last4: String,
    expiryDate: String
  },
  billingInfo: {
    address: String,
    city: String,
    country: String,
    postalCode: String
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
UserSchema.index({ email: 1 })
UserSchema.index({ companyName: 1 })
UserSchema.index({ industry: 1 })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ databaseName: 1 })
UserSchema.index({ trialEndDate: 1 })
UserSchema.index({ subscriptionStatus: 1 })
UserSchema.index({ isTrialActive: 1 })

// Pre-save middleware to set trial end date (7 days from creation)
UserSchema.pre('save', function(next) {
  if (this.isNew && !this.trialEndDate) {
    this.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  next()
})

// Method to check if trial is expired
UserSchema.methods.isTrialExpired = function(): boolean {
  return new Date() > this.trialEndDate
}

// Method to get remaining trial days
UserSchema.methods.getRemainingTrialDays = function(): number {
  const now = new Date()
  const end = this.trialEndDate
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Method to activate subscription
UserSchema.methods.activateSubscription = function(plan: string, duration: number = 30) {
  this.subscriptionStatus = 'active'
  this.subscriptionPlan = plan
  this.subscriptionStartDate = new Date()
  this.subscriptionEndDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
  this.isTrialActive = false
  this.isActive = true
}

// Method to cancel subscription
UserSchema.methods.cancelSubscription = function() {
  this.subscriptionStatus = 'cancelled'
  this.isActive = false
}

// Static method to find expired trials
UserSchema.statics.findExpiredTrials = function() {
  return this.find({
    isTrialActive: true,
    trialEndDate: { $lt: new Date() },
    subscriptionStatus: 'trial'
  })
}

// Static method to find trials expiring soon (within 24 hours)
UserSchema.statics.findTrialsExpiringSoon = function() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return this.find({
    isTrialActive: true,
    trialEndDate: { $lt: tomorrow, $gt: new Date() },
    subscriptionStatus: 'trial'
  })
}

// Static method to generate unique database name
UserSchema.statics.generateUniqueDatabaseName = async function(companyName: string, userId?: string): Promise<string> {
  // Clean company name: remove special characters, convert to lowercase, replace spaces with hyphens
  let baseName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 20) // Limit length to 20 characters

  // If base name is empty, use a default
  if (!baseName) {
    baseName = 'company'
  }

  // Add prefix for database naming convention
  const prefix = 'maamul'
  let databaseName = `${prefix}_${baseName}`
  
  // Check if this database name already exists
  let counter = 1
  let finalDatabaseName = databaseName
  
  while (true) {
    const existingUser = await this.findOne({ 
      databaseName: finalDatabaseName,
      _id: { $ne: userId } // Exclude current user if updating
    })
    
    if (!existingUser) {
      break
    }
    
    // If exists, add a number suffix
    finalDatabaseName = `${databaseName}_${counter}`
    counter++
    
    // Prevent infinite loop (safety measure)
    if (counter > 1000) {
      // If we reach 1000, use timestamp as fallback
      const timestamp = Date.now().toString(36)
      finalDatabaseName = `${databaseName}_${timestamp}`
      break
    }
  }
  
  return finalDatabaseName
}

// Create the model
const UserModel = mongoose.models.User || mongoose.model<IUser, UserModel>('User', UserSchema)

export default UserModel 