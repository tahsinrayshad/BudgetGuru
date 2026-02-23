"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { authUtils } from "@/lib/auth-client";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required");
      }

      // Call the existing login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token in localStorage
      if (data.token) {
        authUtils.setToken(data.token);
      }

      toast.success("Login successful! Redirecting to dashboard...");
      // Reset form
      setFormData({
        email: "",
        password: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#E7D7C1" }}>
      <div className="w-full max-w-md p-8 bg-amber-50 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/budgetguru.png"
            alt="BudgetGuru logo"
            width={240}
            height={240}
            priority
          />
        </div>

        {/* Title */}
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white text-gray-900 outline-none transition"
              style={{ "--tw-ring-color": "#735751" } as React.CSSProperties}
              required
            />
          </div>

          {/* Password Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white text-gray-900 outline-none transition"
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-white font-semibold rounded-md transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isLoading ? "#a78a7f" : "#735751" }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#5e4542")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#735751")}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <a
            href="/"
            className="font-semibold"
            style={{ color: "#735751" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5e4542")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#735751")}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
