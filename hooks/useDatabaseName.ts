import { useState, useEffect } from 'react'

interface DatabaseInfo {
  databaseName: string
  displayName: string
  connectionString: string | null
  isAvailable: boolean
}

interface UseDatabaseNameReturn {
  databaseInfo: DatabaseInfo | null
  loading: boolean
  error: string | null
  refreshDatabaseInfo: () => Promise<void>
}

export function useDatabaseName(userId: string): UseDatabaseNameReturn {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/database?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setDatabaseInfo(data.data)
      } else {
        setError(data.error || 'Failed to fetch database information')
      }
    } catch (err) {
      setError('Network error while fetching database information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDatabaseInfo()
    }
  }, [userId])

  return {
    databaseInfo,
    loading,
    error,
    refreshDatabaseInfo: fetchDatabaseInfo,
  }
} 