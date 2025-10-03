import { type NextRequest, NextResponse } from "next/server"
import { DatabaseNameService } from "@/lib/services/databaseNameService"

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would verify admin permissions here
    // const isAdmin = await verifyAdminPermissions(request)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'

    const databases = await DatabaseNameService.getAllDatabaseNames()
    
    const response: any = {
      success: true,
      data: {
        databases
      }
    }

    if (includeStats) {
      const stats = await DatabaseNameService.getDatabaseStats()
      response.data.stats = stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error getting all databases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 