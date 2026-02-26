"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Call the existing register endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully! Redirecting to login...");
      // Reset form
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--dark-teal)" }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg" style={{ backgroundColor: "var(--ink-black)", color: "var(--foreground)" }}>
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
        <p className="text-center mb-8" style={{ color: "var(--steel-blue)" }}>
          Create your account to get started
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Username Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--steel-blue)" }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--steel-blue)" }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent outline-none transition"
                style={{ 
                  borderColor: "var(--stormy-teal)",
                  backgroundColor: "var(--dark-teal)",
                  color: "var(--foreground)"
                }}
                required
              />
            </div>
          </div>

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
                color: "var(--foreground)"
              }}
              required
            />
          </div>

          {/* Password and Confirm Password Row */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--steel-blue)" }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent outline-none transition"
                style={{ 
                  borderColor: "var(--stormy-teal)",
                  backgroundColor: "var(--dark-teal)",
                  color: "var(--foreground)"
                }}
                required
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-white font-semibold rounded-md transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isLoading ? "var(--steel-blue)" : "var(--stormy-teal)" }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "var(--charcoal-blue)")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "var(--stormy-teal)")}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6" style={{ color: "var(--steel-blue)" }}>
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold"
            style={{ color: "var(--stormy-teal)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal-blue)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stormy-teal)")}
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}