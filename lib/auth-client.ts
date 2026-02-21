import { User, JWTPayload } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const TOKEN_KEY = "auth_token";

export const authUtils = {
  // Store token
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remove token
  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Register user
  async register(
    email: string,
    username: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, name }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      this.setToken(data.token);
    }

    return data;
  },

  // Login user
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; token?: string; message: string }> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      this.setToken(data.token);
    }

    return data;
  },

  // Get current user
  async getCurrentUser(): Promise<{ success: boolean; user?: User; message: string }> {
    const token = this.getToken();

    if (!token) {
      return { success: false, message: "No token found" };
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  },

  // Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.getToken() || ""}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      this.removeToken();
    }

    return data;
  },

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
