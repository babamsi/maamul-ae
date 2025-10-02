import React from 'react'
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TrialStatusBannerProps {
  status: {
    isActive: boolean
    isTrialActive: boolean
    subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
    trialEndDate: string
    remainingTrialDays: number
    isExpired: boolean
    subscriptionPlan?: string
    subscriptionEndDate?: string
  }
  onUpgrade?: () => void
  onReactivate?: () => void
}

export function TrialStatusBanner({ status, onUpgrade, onReactivate }: TrialStatusBannerProps) {
  const getStatusColor = () => {
    switch (status.subscriptionStatus) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'trial':
        return status.remainingTrialDays <= 1 
          ? 'bg-red-50 border-red-200 text-red-800'
          : status.remainingTrialDays <= 3
          ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
          : 'bg-blue-50 border-blue-200 text-blue-800'
      case 'expired':
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (status.subscriptionStatus) {
      case 'active':
        return <CheckCircle className="h-5 w-5" />
      case 'trial':
        return status.remainingTrialDays <= 1 
          ? <XCircle className="h-5 w-5" />
          : <Clock className="h-5 w-5" />
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getStatusMessage = () => {
    switch (status.subscriptionStatus) {
      case 'active':
        return `Your ${status.subscriptionPlan} subscription is active until ${new Date(status.subscriptionEndDate!).toLocaleDateString()}`
      case 'trial':
        if (status.remainingTrialDays <= 0) {
          return 'Your trial has expired. Upgrade now to continue using Maamul.'
        } else if (status.remainingTrialDays === 1) {
          return 'Your trial expires tomorrow! Upgrade now to keep your data safe.'
        } else {
          return `You have ${status.remainingTrialDays} days left in your trial.`
        }
      case 'expired':
        return 'Your subscription has expired. Upgrade to restore access to your account.'
      case 'cancelled':
        return 'Your subscription has been cancelled. Reactivate to restore access to your data.'
      default:
        return 'Subscription status unknown.'
    }
  }

  const getActionButton = () => {
    switch (status.subscriptionStatus) {
      case 'active':
        return null
      case 'trial':
        if (status.remainingTrialDays <= 1) {
          return (
            <Button onClick={onUpgrade} className="bg-red-600 hover:bg-red-700">
              Upgrade Now
            </Button>
          )
        } else {
          return (
            <Button onClick={onUpgrade} variant="outline">
              Upgrade
            </Button>
          )
        }
      case 'expired':
        return (
          <Button onClick={onUpgrade} className="bg-red-600 hover:bg-red-700">
            Restore Access
          </Button>
        )
      case 'cancelled':
        return (
          <Button onClick={onReactivate} className="bg-blue-600 hover:bg-blue-700">
            Reactivate
          </Button>
        )
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    switch (status.subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">{getStatusMessage()}</p>
              {getStatusBadge()}
            </div>
            {status.subscriptionStatus === 'trial' && status.remainingTrialDays > 0 && (
              <p className="text-sm opacity-75">
                Trial ends: {new Date(status.trialEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {getActionButton()}
      </div>
    </div>
  )
} 