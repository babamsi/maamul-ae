// Supabase setup: This service previously created per-tenant MongoDB databases.
// With Supabase, we rely on a single-tenant schema + row-level scoping, so this
// becomes a no-op placeholder to keep the call sites intact.

export class DatabaseCreatorService {
  // No-op placeholder for Supabase setup. Kept for backwards-compatible calls.
  static async createUserDatabase() {
    return { success: true, message: 'Supabase: no per-tenant DB creation required' }
  }

  static async createDatabaseAndModels(databaseName: string, userId: string) {
    // In Supabase, we do not create separate databases per user.
    console.log(`Supabase mode: skipping per-tenant DB creation for ${databaseName} (user ${userId})`)
    return { success: true, message: 'Supabase: skipped per-tenant DB creation' }
  }

  static async databaseExists(_databaseName: string): Promise<boolean> {
    return true
  }

  static getDatabaseConnectionString(_databaseName: string): string {
    return ''
  }

  static async deleteUserDatabase(_databaseName: string): Promise<boolean> {
    return true
  }
}