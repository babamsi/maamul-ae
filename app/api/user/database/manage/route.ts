import { type NextRequest, NextResponse } from "next/server"
import { DatabaseCreatorService } from "@/lib/services/databaseCreatorService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const databaseName = searchParams.get('databaseName')

    if (!databaseName) {
      return NextResponse.json({ error: "Database name is required" }, { status: 400 })
    }

    const exists = await DatabaseCreatorService.databaseExists(databaseName)
    const connectionString = DatabaseCreatorService.getDatabaseConnectionString(databaseName)

    return NextResponse.json({
      success: true,
      data: {
        databaseName,
        exists,
        connectionString,
        status: exists ? 'active' : 'not_found'
      }
    })

  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const databaseName = searchParams.get('databaseName')

    if (!databaseName) {
      return NextResponse.json({ error: "Database name is required" }, { status: 400 })
    }

    const deleted = await DatabaseCreatorService.deleteUserDatabase(databaseName)

    return NextResponse.json({
      success: deleted,
      message: deleted 
        ? `Database '${databaseName}' deleted successfully`
        : `Failed to delete database '${databaseName}'`
    })

  } catch (error) {
    console.error("Error deleting database:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 