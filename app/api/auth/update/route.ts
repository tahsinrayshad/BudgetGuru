import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/services/auth.service";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from header
    const authHeader = request.headers.get("Authorization");
    const token = getTokenFromHeader(authHeader || "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const tokenResponse = verifyToken(token);

    if (!tokenResponse.valid || !tokenResponse.user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse request body
    const { email, username, name } = await request.json();

    // Validate at least one field is provided
    if (!email && !username && !name) {
      return NextResponse.json(
        { success: false, message: "At least one field is required to update" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (name) updateData.name = name;

    // Update user
    const result = await updateUser(tokenResponse.user.userId, updateData);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 }
    );
  }
}
