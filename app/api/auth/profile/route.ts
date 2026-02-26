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

    const user = await prisma.user.findUnique({
      where: { id: decoded.user.userId },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      currency: (user as any).currency || "USD",
      dateFormat: (user as any).dateFormat || "MM/DD/YYYY",
      notificationsEnabled: (user as any).notificationsEnabled !== false,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { name, currency, dateFormat, notificationsEnabled } = body

    const updatedUser = await prisma.user.update({
      where: { id: decoded.user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(currency !== undefined && { currency: currency as any }),
        ...(dateFormat !== undefined && { dateFormat: dateFormat as any }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled: notificationsEnabled as any }),
      },
    })

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      currency: (updatedUser as any).currency || "USD",
      dateFormat: (updatedUser as any).dateFormat || "MM/DD/YYYY",
      notificationsEnabled: (updatedUser as any).notificationsEnabled !== false,
      createdAt: updatedUser.createdAt,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
