"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
      setShowPasswords({ current: false, new: false, confirm: false })
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }

      toast.success("Password changed successfully!")
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
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

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm sm:max-w-md p-4 sm:p-0">
        <div
          className="rounded-lg border shadow-lg animate-in fade-in zoom-in duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "var(--steel-blue)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 sm:p-6 border-b"
            style={{ borderColor: "var(--steel-blue)" }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--charcoal-blue)" }}
            >
              Change Password
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition"
              disabled={isLoading}
            >
              <X className="size-5" style={{ color: "var(--stormy-teal)" }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Current Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pr-10"
                  style={{
                    borderColor: errors.currentPassword
                      ? "#ef4444"
                      : "var(--steel-blue)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--charcoal-blue)",
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({
                      ...p,
                      current: !p.current,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--stormy-teal)" }}
                >
                  {showPasswords.current ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pr-10"
                  style={{
                    borderColor: errors.newPassword
                      ? "#ef4444"
                      : "var(--steel-blue)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--charcoal-blue)",
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({
                      ...p,
                      new: !p.new,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--stormy-teal)" }}
                >
                  {showPasswords.new ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pr-10"
                  style={{
                    borderColor: errors.confirmPassword
                      ? "#ef4444"
                      : "var(--steel-blue)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--charcoal-blue)",
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({
                      ...p,
                      confirm: !p.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--stormy-teal)" }}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.confirmPassword}
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
                type="submit"
                disabled={isLoading}
                className="flex-1"
                style={{
                  backgroundColor: "var(--stormy-teal)",
                  color: "#FFFFFF",
                  border: "none",
                }}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
