import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JWTPayload, VerifyTokenResponse } from "@/types/auth";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY: string | number = process.env.JWT_EXPIRY || "7d";

export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: (JWT_EXPIRY as SignOptions["expiresIn"]) ?? "7d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): VerifyTokenResponse {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      valid: true,
      user: decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

export function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
