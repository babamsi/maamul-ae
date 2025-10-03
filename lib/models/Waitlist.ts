import mongoose, { Schema, Document } from 'mongoose'

export interface IWaitlist extends Document {
  name: string
  email: string
  company: string
  industry: string
  isNotified: boolean
  createdAt: Date
  updatedAt: Date
}

const WaitlistSchema: Schema = new Schema({
  name: {
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
  company: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['retail', 'wholesale', 'manufacturing', 'logistics', 'hospitality', 'healthcare', 'agriculture']
  },
  isNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
WaitlistSchema.index({ email: 1 })
WaitlistSchema.index({ industry: 1 })
WaitlistSchema.index({ isNotified: 1 })
WaitlistSchema.index({ createdAt: -1 })

export default mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema) 