import { type NextRequest, NextResponse } from "next/server"
import { DatabaseNameService } from "@/lib/services/databaseNameService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const databaseName = await DatabaseNameService.getUserDatabaseName(userId)
    
    if (!databaseName) {
      return NextResponse.json({ error: "Database not found for user" }, { status: 404 })
    }

    const connectionString = await DatabaseNameService.getDatabaseConnectionString(userId)
    const displayName = DatabaseNameService.cleanDatabaseNameForDisplay(databaseName)

    return NextResponse.json({
      success: true,
      data: {
        databaseName,
        displayName,
        connectionString,
        isAvailable: await DatabaseNameService.isDatabaseNameAvailable(databaseName, userId)
      }
    })

  } catch (error) {
    console.error("Error getting database info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 