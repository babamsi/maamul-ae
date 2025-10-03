import { useState, useEffect } from 'react'

interface TrialStatus {
  isActive: boolean
  isTrialActive: boolean
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  trialEndDate: string
  remainingTrialDays: number
  isExpired: boolean
  subscriptionPlan?: string
  subscriptionEndDate?: string
}

interface UseTrialStatusReturn {
  status: TrialStatus | null
  loading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  upgradeSubscription: (plan: string) => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
}

export function useTrialStatus(userId: string): UseTrialStatusReturn {
  const [status, setStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/subscription/status?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data.data)
      } else {
        setError(data.error || 'Failed to fetch trial status')
      }
    } catch (err) {
      setError('Network error while fetching trial status')
    } finally {
      setLoading(false)
    }
  }

  const upgradeSubscription = async (plan: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          plan,
          duration: 30
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Refresh status after successful upgrade
        await fetchStatus()
        return true
      } else {
        setError(data.error || 'Failed to upgrade subscription')
        return false
      }
    } catch (err) {
      setError('Network error while upgrading subscription')
      return false
    }
  }

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Refresh status after successful cancellation
        await fetchStatus()
        return true
      } else {
        setError(data.error || 'Failed to cancel subscription')
        return false
      }
    } catch (err) {
      setError('Network error while cancelling subscription')
      return false
    }
  }

  useEffect(() => {
    if (userId) {
      fetchStatus()
    }
  }, [userId])

  return {
    status,
    loading,
    error,
    refreshStatus: fetchStatus,
    upgradeSubscription,
    cancelSubscription,
  }
} 