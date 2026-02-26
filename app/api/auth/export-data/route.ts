import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded.valid || !decoded.user) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    // Fetch all user data
    const [user, budgets, transactions, loans] = await Promise.all([
      prisma.user.findUnique({
        where: { id: decoded.user.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.budget.findMany({
        where: { userId: decoded.user.userId },
      }),
      prisma.transaction.findMany({
        where: { userId: decoded.user.userId },
      }),
      prisma.loan.findMany({
        where: { userId: decoded.user.userId },
      }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      budgets,
      transactions,
      loans,
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
