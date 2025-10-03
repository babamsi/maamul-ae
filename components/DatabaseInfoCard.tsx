import React from 'react'
import { Database, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DatabaseInfoCardProps {
  databaseInfo: {
    databaseName: string
    displayName: string
    connectionString: string | null
    isAvailable: boolean
  }
  onCopyConnectionString?: () => void
}

export function DatabaseInfoCard({ databaseInfo, onCopyConnectionString }: DatabaseInfoCardProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (onCopyConnectionString) {
        onCopyConnectionString()
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <CardTitle>Database Information</CardTitle>
          <Badge 
            variant={databaseInfo.isAvailable ? "default" : "destructive"}
            className="ml-auto"
          >
            {databaseInfo.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <CardDescription>
          Your unique database instance for Maamul
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Database Name</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded mt-1">
              {databaseInfo.databaseName}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Display Name</label>
            <p className="text-sm text-gray-900 p-2 rounded mt-1">
              {databaseInfo.displayName}
            </p>
          </div>
        </div>

        {databaseInfo.connectionString && (
          <div>
            <label className="text-sm font-medium text-gray-600">Connection String</label>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded flex-1 truncate">
                {databaseInfo.connectionString}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(databaseInfo.connectionString!)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {databaseInfo.isAvailable ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Database is active and ready for use</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Database is currently unavailable</span>
            </>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This database name is unique to your account and will be used 
            for all your business data storage. Keep it secure and don't share it publicly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 