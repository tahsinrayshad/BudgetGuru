import { NextRequest, NextResponse } from "next/server";
import { createBudget, getAllBudgetsByUser } from "@/services/budget.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { BudgetRequest } from "@/types/budget";

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
    const { title, amount, description, startDate, endDate, status } =
      (await request.json()) as BudgetRequest;

    // Validate required fields
    if (!title || !amount || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, amount, startDate, and endDate are required",
        },
        { status: 400 }
      );
    }

    // Create budget
    const result = await createBudget(tokenResponse.user.userId, {
      title,
      amount,
      description,
      startDate,
      endDate,
      status,
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
        message: error instanceof Error ? error.message : "Failed to create budget",
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

    // Get all budgets for user
    const result = await getAllBudgetsByUser(tokenResponse.user.userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch budgets",
      },
      { status: 500 }
    );
  }
}
