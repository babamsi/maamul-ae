import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export class SubscriptionService {
  /**
   * Check and update expired trials
   */
  static async checkExpiredTrials() {
    try {
      const nowIso = new Date().toISOString()
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('is_trial_active', true)
        .eq('subscription_status', 'trial')
        .lt('trial_end_date', nowIso)

      if (error) throw error

      const expiredTrials = data || []

      for (const user of expiredTrials) {
        await this.expireTrial(user)
      }

      console.log(`Processed ${expiredTrials.length} expired trials`)
      return expiredTrials.length
    } catch (error) {
      console.error('Error checking expired trials:', error)
      throw error
    }
  }

  /**
   * Send expiration notifications
   */
  static async sendExpirationNotifications() {
    try {
      const tomorrowIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const nowIso = new Date().toISOString()
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('is_trial_active', true)
        .eq('subscription_status', 'trial')
        .lt('trial_end_date', tomorrowIso)
        .gt('trial_end_date', nowIso)

      if (error) throw error

      const expiringSoon = data || []

      for (const user of expiringSoon) {
        await this.sendExpirationWarning(user as any)
      }

      console.log(`Sent ${expiringSoon.length} expiration warnings`)
      return expiringSoon.length
    } catch (error) {
      console.error('Error sending expiration notifications:', error)
      throw error
    }
  }

  /**
   * Expire a user's trial
   */
  static async expireTrial(user: any) {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_trial_active: false,
          is_active: false,
          subscription_status: 'expired'
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Send expiration email
      await this.sendTrialExpiredEmail(user)
      
      console.log(`Trial expired for user: ${user.email}`)
    } catch (error) {
      console.error(`Error expiring trial for user ${user.email}:`, error)
      throw error
    }
  }

  /**
   * Activate subscription for a user
   */
  static async activateSubscription(userId: string, plan: string, duration: number = 30) {
    try {
      const subscriptionStart = new Date()
      const subscriptionEnd = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_start_date: subscriptionStart.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString(),
          is_trial_active: false,
          is_active: true,
        })
        .eq('id', userId)
        .select('*')
        .single()

      if (error) throw error
      
      // Send activation email
      await this.sendSubscriptionActivatedEmail(data)
      
      console.log(`Subscription activated for user: ${data.email}`)
      return data
    } catch (error) {
      console.error('Error activating subscription:', error)
      throw error
    }
  }

  /**
   * Cancel subscription for a user
   */
  static async cancelSubscription(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          subscription_status: 'cancelled',
          is_active: false,
        })
        .eq('id', userId)
        .select('*')
        .single()

      if (error) throw error
      
      // Send cancellation email
      await this.sendSubscriptionCancelledEmail(data)
      
      console.log(`Subscription cancelled for user: ${data.email}`)
      return data
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }
  }

  /**
   * Get user subscription status
   */
  static async getUserStatus(userId: string) {
    try {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw new Error('User not found')
      }

      const now = new Date()
      const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null
      const isExpired = trialEnd ? now > trialEnd : false
      const remainingDays = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0
      
      return {
        isActive: user.is_active,
        isTrialActive: user.is_trial_active,
        subscriptionStatus: user.subscription_status,
        trialEndDate: user.trial_end_date,
        remainingTrialDays: remainingDays,
        isExpired,
        subscriptionPlan: user.subscription_plan,
        subscriptionEndDate: user.subscription_end_date
      }
    } catch (error) {
      console.error('Error getting user status:', error)
      throw error
    }
  }

  /**
   * Send trial expiration warning email
   */
  private static async sendExpirationWarning(user: any) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const remainingDays = user.getRemainingTrialDays()
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Trial Expiring Soon</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Maamul Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.managerName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your Maamul trial will expire in <strong>${remainingDays} day${remainingDays !== 1 ? 's' : ''}</strong> on ${user.trialEndDate.toLocaleDateString()}.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Don't lose access to your business data!</h3>
            <p style="color: #666; margin-bottom: 0;">
              Upgrade to a paid plan to continue using Maamul and keep all your business information, settings, and data intact.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/upgrade" style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Upgrade Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@maamul.com" style="color: #D4AF37;">support@maamul.com</a>
          </p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Maamul trial expires in ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`,
      html: emailHtml,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Expiration warning sent to: ${user.email}`)
    } catch (error) {
      console.error(`Failed to send expiration warning to ${user.email}:`, error)
    }
  }

  /**
   * Send trial expired email
   */
  private static async sendTrialExpiredEmail(user: any) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Trial Expired</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Maamul Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.managerName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your Maamul trial has expired. Your account has been temporarily suspended, but your data is safe and will be restored once you upgrade to a paid plan.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Account Suspended</h3>
            <p style="color: #856404; margin-bottom: 0;">
              You can no longer access your Maamul dashboard. Upgrade now to restore access and continue managing your business.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/upgrade" style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Restore Access
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@maamul.com" style="color: #D4AF37;">support@maamul.com</a>
          </p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Maamul trial has expired',
      html: emailHtml,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Trial expired email sent to: ${user.email}`)
    } catch (error) {
      console.error(`Failed to send trial expired email to ${user.email}:`, error)
    }
  }

  /**
   * Send subscription activated email
   */
  private static async sendSubscriptionActivatedEmail(user: any) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Maamul!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your subscription is now active</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.managerName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your Maamul subscription has been activated. You now have full access to all features and your business data.
          </p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">✅ Subscription Details</h3>
            <p style="color: #155724; margin-bottom: 0;">
              <strong>Plan:</strong> ${user.subscriptionPlan}<br>
              <strong>Next billing:</strong> ${user.subscriptionEndDate?.toLocaleDateString()}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Thank you for choosing Maamul! Contact us at <a href="mailto:support@maamul.com" style="color: #28a745;">support@maamul.com</a> for any questions.
          </p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Maamul - Your subscription is active!',
      html: emailHtml,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Subscription activated email sent to: ${user.email}`)
    } catch (error) {
      console.error(`Failed to send subscription activated email to ${user.email}:`, error)
    }
  }

  /**
   * Send subscription cancelled email
   */
  private static async sendSubscriptionCancelledEmail(user: any) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Cancelled</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Maamul Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.managerName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your Maamul subscription has been cancelled. Your account access has been suspended, but your data will be preserved for 30 days.
          </p>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">⚠️ Account Suspended</h3>
            <p style="color: #721c24; margin-bottom: 0;">
              You can reactivate your subscription at any time within 30 days to restore access to your data and continue using Maamul.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/reactivate" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reactivate Subscription
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:support@maamul.com" style="color: #dc3545;">support@maamul.com</a>
          </p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Maamul subscription has been cancelled',
      html: emailHtml,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Subscription cancelled email sent to: ${user.email}`)
    } catch (error) {
      console.error(`Failed to send subscription cancelled email to ${user.email}:`, error)
    }
  }
} 