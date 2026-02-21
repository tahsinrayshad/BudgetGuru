export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export type UserResponse = Omit<User, "password" | "createdAt" | "updatedAt">;

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: JWTPayload;
  error?: string;
}
