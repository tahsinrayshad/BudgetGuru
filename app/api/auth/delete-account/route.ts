import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-client"
import { verifyToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
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
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: decoded.user.userId },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password is incorrect" },
        { status: 400 }
      )
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: decoded.user.userId },
    })

    return NextResponse.json({
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
