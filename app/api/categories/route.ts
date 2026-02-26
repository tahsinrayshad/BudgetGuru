import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

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

    // Get unique categories for the user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: tokenResponse.user.userId,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categories = transactions
      .map((t) => t.category)
      .filter((cat) => cat && cat.trim() !== "")
      .sort();

    // Remove duplicates and ensure unique categories
    const uniqueCategories = Array.from(new Set(categories));

    return NextResponse.json(
      {
        success: true,
        categories: uniqueCategories,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}
