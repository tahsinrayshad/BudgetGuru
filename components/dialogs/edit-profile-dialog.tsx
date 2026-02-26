"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated: () => void
  currentName: string | null
}

export function EditProfileDialog({
  isOpen,
  onClose,
  onProfileUpdated,
  currentName,
}: EditProfileDialogProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      setName(currentName || "")
      setErrors({})
    }
  }, [isOpen, currentName])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
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
        `${window.location.origin}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name.trim() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      toast.success("Profile updated successfully!")
      onProfileUpdated()
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
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
              Edit Profile
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
            {/* Name */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--charcoal-blue)" }}
              >
                Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full"
                style={{
                  borderColor: errors.name ? "#ef4444" : "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              />
              {errors.name && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.name}
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
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
