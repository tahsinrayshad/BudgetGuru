"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { authUtils } from "@/lib/auth-client";

export default function Home() {
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
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "var(--dark-teal)" }}>
      <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-8 bg-white rounded-lg shadow-lg" style={{ backgroundColor: "var(--ink-black)", color: "var(--foreground)" }}>
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/budgetguru.png"
            alt="BudgetGuru logo"
            width={200}
            height={200}
            className="w-32 sm:w-48 h-auto"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--stormy-teal)" }}>
          Welcome Back
        </h1>

        <p className="text-center text-sm sm:text-base mb-6 sm:mb-8" style={{ color: "var(--steel-blue)" }}>
          Sign in to your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Row */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--steel-blue)" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent outline-none transition"
              style={{ 
                borderColor: "var(--stormy-teal)",
                backgroundColor: "var(--dark-teal)",
                color: "var(--foreground)",
                "--tw-ring-color": "var(--stormy-teal)"
              } as React.CSSProperties}
              required
            />
          </div>

          {/* Password Row */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--steel-blue)" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent outline-none transition"
              style={{
                borderColor: "var(--stormy-teal)",
                backgroundColor: "var(--dark-teal)",
                color: "var(--foreground)"
              }}
              required
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-white font-semibold rounded-md transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isLoading ? "var(--steel-blue)" : "var(--stormy-teal)" }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "var(--charcoal-blue)")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "var(--stormy-teal)")}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6" style={{ color: "var(--steel-blue)" }}>
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-semibold"
            style={{ color: "var(--stormy-teal)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal-blue)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stormy-teal)")}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}