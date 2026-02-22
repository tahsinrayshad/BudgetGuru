import { NextRequest, NextResponse } from "next/server";
import { getTimeBasedAnalytics } from "@/services/analytics.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { AnalyticsPeriod } from "@/types/analytics";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    const token = getTokenFromHeader(authHeader || "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const tokenResponse = verifyToken(token);

    if (!tokenResponse.valid || !tokenResponse.user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as AnalyticsPeriod) || "this-month";

    // Validate period
    const validPeriods: AnalyticsPeriod[] = ["all-time", "this-month", "last-month", "this-year"];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { success: false, message: "Invalid period parameter" },
        { status: 400 }
      );
    }

    const result = await getTimeBasedAnalytics(tokenResponse.user.userId, period);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch time-based analytics",
      },
      { status: 500 }
    );
  }
}
