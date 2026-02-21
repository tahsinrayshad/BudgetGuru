import { NextRequest, NextResponse } from "next/server";
import { getTransactionsByLoan } from "@/services/transaction.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
): Promise<NextResponse> {
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

    const { loanId } = await params;

    // Get transactions by loan
    const result = await getTransactionsByLoan(loanId, tokenResponse.user.userId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}
