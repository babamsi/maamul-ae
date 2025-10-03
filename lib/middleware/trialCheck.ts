import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscriptionService'

export async function checkTrialStatus(request: NextRequest, userId: string) {
  try {
    const status = await SubscriptionService.getUserStatus(userId)
    
    // If trial is expired and user is not on a paid plan, redirect to upgrade
    if (status.isExpired && status.subscriptionStatus === 'trial') {
      return NextResponse.redirect(new URL('/upgrade', request.url))
    }
    
    // If subscription is cancelled, redirect to reactivate
    if (status.subscriptionStatus === 'cancelled') {
      return NextResponse.redirect(new URL('/reactivate', request.url))
    }
    
    // If subscription is expired, redirect to upgrade
    if (status.subscriptionStatus === 'expired') {
      return NextResponse.redirect(new URL('/upgrade', request.url))
    }
    
    // Add trial status to request headers for use in components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-trial-status', JSON.stringify(status))
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Error checking trial status:', error)
    // If there's an error, allow the request to continue
    return NextResponse.next()
  }
}

export function getTrialStatusFromHeaders(request: NextRequest) {
  try {
    const trialStatus = request.headers.get('x-trial-status')
    return trialStatus ? JSON.parse(trialStatus) : null
  } catch (error) {
    console.error('Error parsing trial status from headers:', error)
    return null
  }
} 