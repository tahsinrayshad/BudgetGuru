import { NextRequest, NextResponse } from "next/server"
import { getDashboardData } from "@/services/dashboard.service"
import { verifyToken, getTokenFromHeader } from "@/lib/jwt"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization")
    const token = getTokenFromHeader(authHeader || "")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    const tokenResponse = verifyToken(token)

    if (!tokenResponse.valid || !tokenResponse.user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get("timeRange") as "week" | "month" | "quarter" | "year") || "month"

    const dashboardData = await getDashboardData(tokenResponse.user.userId, timeRange)

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch dashboard data",
      },
      { status: 500 }
    )
  }
}
