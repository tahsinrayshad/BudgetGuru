import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { TransactionUpdateRequest } from "@/types/transaction";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: transactionId } = await params;

    // Get transaction
    const result = await getTransactionById(transactionId, tokenResponse.user.userId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        result,
        { status: result.message === "Transaction not found" ? 404 : 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch transaction",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: transactionId } = await params;
    const updateData = (await request.json()) as TransactionUpdateRequest;

    // Validate at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one field is required to update" },
        { status: 400 }
      );
    }

    // Update transaction
    const result = await updateTransaction(
      transactionId,
      tokenResponse.user.userId,
      updateData
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        result,
        { status: result.message === "Transaction not found" ? 404 : 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update transaction",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: transactionId } = await params;

    // Delete transaction
    const result = await deleteTransaction(transactionId, tokenResponse.user.userId);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        result,
        { status: result.message === "Transaction not found" ? 404 : 403 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete transaction",
      },
      { status: 500 }
    );
  }
}
