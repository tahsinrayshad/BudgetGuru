import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Clear the authentication token by returning a response that clears the client-side token
    // In a cookie-based setup, you would clear the cookie here
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Logout failed",
      },
      { status: 500 }
    );
  }
}
