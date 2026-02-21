import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma-client";
import { generateToken } from "@/lib/jwt";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";

const SALT_ROUNDS = 10;

// Helper function to format user response (exclude sensitive fields)
function formatUserResponse(user: any): Omit<User, "password" | "createdAt" | "updatedAt"> {
  const { password, createdAt, updatedAt, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
}

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email or username already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        name: data.name || null,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      success: true,
      message: "User registered successfully",
      user: formatUserResponse(user),
      token,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(data.password, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      success: true,
      message: "Login successful",
      user: formatUserResponse(user),
      token,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user || null;
  } catch (error) {
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<AuthResponse> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      success: true,
      message: "User updated successfully",
      user: formatUserResponse(user),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Update failed",
    };
  }
}
