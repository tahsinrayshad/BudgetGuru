import { NextRequest, NextResponse } from "next/server";
import { createLoan, getAllLoansByUser } from "@/services/loan.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { LoanRequest } from "@/types/loan";

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Parse request body
    const { type, amount, description, deadline, isPaid } =
      (await request.json()) as LoanRequest;

    // Validate required fields
    if (!type || !amount || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Type, amount, and deadline are required",
        },
        { status: 400 }
      );
    }

    // Create loan
    const result = await createLoan(tokenResponse.user.userId, {
      type,
      amount,
      description,
      deadline,
      isPaid,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create loan",
      },
      { status: 500 }
    );
  }
}

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

    // Get all loans for user
    const result = await getAllLoansByUser(tokenResponse.user.userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch loans",
      },
      { status: 500 }
    );
  }
}
