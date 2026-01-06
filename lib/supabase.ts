import { createClient } from '@supabase/supabase-js'

// Server-side Supabase admin client. Requires service role key.
// Ensure these env vars are set:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export type UserRow = {
  id: string
  manager_name: string
  company_name: string
  email: string
  phone?: string | null
  location?: string | null
  business_age?: string | null
  primary_goal?: string | null
  biggest_challenge?: string | null
  daily_hours?: string | null
  password_hash: string
  industry: string
  onboarding_data: any
  team_members: Array<{ name: string; email: string; role: string }>
  is_active: boolean
  is_verified: boolean
  database_name?: string | null
  trial_start_date: string
  trial_end_date: string
  is_trial_active: boolean
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription_plan?: string | null
  subscription_start_date?: string | null
  subscription_end_date?: string | null
  created_at: string
  updated_at: string
}


