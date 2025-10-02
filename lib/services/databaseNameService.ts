import { supabaseAdmin } from '@/lib/supabase'

export class DatabaseNameService {
  /**
   * Generate a unique database name for a company
   */
  static async generateDatabaseName(companyName: string, userId?: string): Promise<string> {
    // Clean base name
    let baseName = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20)

    if (!baseName) baseName = 'company'

    const prefix = 'maamul'
    const root = `${prefix}_${baseName}`

    let counter = 0
    let candidate = root

    while (true) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('database_name', candidate)
        .limit(1)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data || (userId && data.id === userId)) {
        return candidate
      }

      counter++
      if (counter > 1000) {
        const ts = Date.now().toString(36)
        return `${root}_${ts}`
      }
      candidate = `${root}_${counter}`
    }
  }

  /**
   * Validate if a database name is available
   */
  static async isDatabaseNameAvailable(databaseName: string, userId?: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('database_name', databaseName.toLowerCase())
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data) return true
    return userId ? data.id === userId : false
  }

  /**
   * Get database name for a user
   */
  static async getUserDatabaseName(userId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('database_name')
      .eq('id', userId)
      .single()

    if (error) return null
    return data?.database_name || null
  }

  /**
   * Update database name for a user (if company name changes)
   */
  static async updateDatabaseName(userId: string, newCompanyName: string): Promise<string> {
    const newDatabaseName = await this.generateDatabaseName(newCompanyName, userId)
    const { error } = await supabaseAdmin
      .from('users')
      .update({ database_name: newDatabaseName })
      .eq('id', userId)

    if (error) throw error
    return newDatabaseName
  }

  /**
   * Get database connection string for a user
   */
  static async getDatabaseConnectionString(userId: string): Promise<string | null> {
    // Not applicable for Supabase single-tenant setup
    return null
  }

  /**
   * Get all database names (for admin purposes)
   */
  static async getAllDatabaseNames(): Promise<Array<{ userId: string, companyName: string, databaseName: string }>> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, company_name, database_name')

    if (error || !data) return []
    return data.map((u: any) => ({
      userId: u.id,
      companyName: u.company_name,
      databaseName: u.database_name,
    }))
  }

  /**
   * Clean database name for display
   */
  static cleanDatabaseNameForDisplay(databaseName: string): string {
    return databaseName.replace('maamul_', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    totalDatabases: number
    activeDatabases: number
    trialDatabases: number
    expiredDatabases: number
  }> {
    const counts = async (filter: Record<string, any>) => {
      const { count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .match(filter)
      return count || 0
    }

    const [totalDatabases, activeDatabases, trialDatabases, expiredDatabases] = await Promise.all([
      counts({}),
      counts({ is_active: true }),
      counts({ subscription_status: 'trial' }),
      counts({ subscription_status: 'expired' }),
    ])

    return { totalDatabases, activeDatabases, trialDatabases, expiredDatabases }
  }
} 