import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { JWTPayload } from "@/types/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function authenticate(handler: any) {
  return async (
    request: NextRequest,
    context: any
  ): Promise<NextResponse> => {
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

    // Attach user to request
    (request as any).user = tokenResponse.user;

    return handler(request, context);
  };
}
