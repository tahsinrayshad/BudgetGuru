import { NextRequest, NextResponse } from "next/server";
import {
  createTransaction,
  getAllTransactionsByUser,
} from "@/services/transaction.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { TransactionRequest } from "@/types/transaction";

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
    const { type, amount, description, category, transactionDate, budgetId, loanId } =
      (await request.json()) as TransactionRequest;

    // Validate required fields
    if (!type || !amount || !transactionDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Type, amount, and transactionDate are required",
        },
        { status: 400 }
      );
    }

    // Create transaction
    const result = await createTransaction(tokenResponse.user.userId, {
      type,
      amount,
      description,
      category,
      transactionDate,
      budgetId,
      loanId,
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
        message:
          error instanceof Error ? error.message : "Failed to create transaction",
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

    // Get all transactions for user
    const result = await getAllTransactionsByUser(tokenResponse.user.userId);

    return NextResponse.json(result, { status: 200 });
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
