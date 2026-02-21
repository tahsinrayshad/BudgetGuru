import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";
import { RegisterRequest, AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, username, password, name } =
      (await request.json()) as RegisterRequest;

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, username, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const result = await registerUser({ email, username, password, name });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}
