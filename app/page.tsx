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
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#E7D7C1" }}>
      <div className="w-full max-w-md p-8 bg-amber-50 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/writing.png"
            alt="BudgetGuru logo"
            width={240}
            height={240}
            priority
          />
        </div>

        {/* Title */}
        <p className="text-center text-gray-600 mb-8">
          Create your account to get started
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Username Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white text-gray-900 outline-none transition"
                style={{ "--tw-ring-color": "#735751" } as React.CSSProperties}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white text-gray-900 outline-none transition"
                required
              />
            </div>
          </div>

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
              required
            />
          </div>

          {/* Password and Confirm Password Row */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white text-gray-900 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-white font-semibold rounded-md transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isLoading ? "#a78a7f" : "#735751" }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#5e4542")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#735751")}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold"
            style={{ color: "#735751" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5e4542")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#735751")}
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}