"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setPassword("")
      setError("")
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!password) {
      setError("Password is required")
      return
    }

    setIsLoading(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to delete account")
        return
      }

      toast.success("Account deleted successfully")
      authUtils.removeToken()
      router.push("/")
      onClose()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete account"
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm sm:max-w-md p-4 sm:p-0">
        <div
          className="rounded-lg border shadow-lg animate-in fade-in zoom-in duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#ef4444",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 sm:p-6 border-b"
            style={{ borderColor: "var(--steel-blue)" }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "#ef4444" }}
            >
              Delete Account
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition"
              disabled={isLoading}
            >
              <X className="size-5" style={{ color: "var(--stormy-teal)" }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Warning */}
            <div
              className="p-3 rounded-md"
              style={{
                backgroundColor: "#fef2f2",
                borderLeft: "4px solid #ef4444",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--charcoal-blue)" }}
              >
                ⚠️ This action cannot be undone. Deleting your account will:
              </p>
              <ul
                className="text-xs mt-2 space-y-1 ml-2"
                style={{ color: "#dc2626" }}
              >
                <li>• Delete all your data permanently</li>
                <li>• Remove all budgets and transactions</li>
                <li>• Cancel all loans associated with this account</li>
              </ul>
            </div>

            {/* Email confirmation */}
            <div>
              <p
                className="text-sm mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                Account email: <span className="font-medium">{userEmail}</span>
              </p>
            </div>

            {/* Password input */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                Enter your password to confirm
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-md border"
                style={{
                  borderColor: error ? "#ef4444" : "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              />
              {error && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
                style={{
                  borderColor: "var(--stormy-teal)",
                  color: "var(--charcoal-blue)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
                style={{
                  backgroundColor: "#ef4444",
                  color: "#FFFFFF",
                  border: "none",
                }}
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
