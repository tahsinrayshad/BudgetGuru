"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2 } from "lucide-react"
import { authUtils } from "@/lib/auth-client"
import { EditProfileDialog } from "@/components/dialogs/edit-profile-dialog"

interface ProfileInfoSectionProps {
  email: string
  username: string
  name: string | null
  createdAt: Date
  onProfileUpdated: () => void
}

export function ProfileInfoSection({
  email,
  username,
  name,
  createdAt,
  onProfileUpdated,
}: ProfileInfoSectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleProfileUpdated = () => {
    setIsEditDialogOpen(false)
    onProfileUpdated()
  }

  return (
    <>
      <Card
        className="p-6 sm:p-8"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--charcoal-blue)" }}
          >
            Profile Information
          </h3>
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2"
            style={{
              backgroundColor: "var(--stormy-teal)",
              color: "#FFFFFF",
              border: "none",
            }}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {/* Profile Avatar/Initial */}
        <div className="mb-8 flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundColor: "var(--dark-teal)",
              color: "#FFFFFF",
            }}
          >
            {(name || username).charAt(0).toUpperCase()}
          </div>
          <div>
            <h4
              className="text-xl font-semibold"
              style={{ color: "var(--charcoal-blue)" }}
            >
              {name || username}
            </h4>
            <p className="text-sm" style={{ color: "var(--stormy-teal)" }}>
              @{username}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Email */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: "#f9fafb" }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--stormy-teal)" }}
            >
              EMAIL ADDRESS
            </p>
            <p className="text-sm" style={{ color: "var(--charcoal-blue)" }}>
              {email}
            </p>
          </div>

          {/* Username */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: "#f9fafb" }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--stormy-teal)" }}
            >
              USERNAME
            </p>
            <p className="text-sm" style={{ color: "var(--charcoal-blue)" }}>
              {username}
            </p>
          </div>

          {/* Joined Date */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: "#f9fafb" }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--stormy-teal)" }}
            >
              JOINED DATE
            </p>
            <p className="text-sm" style={{ color: "var(--charcoal-blue)" }}>
              {formatDate(new Date(createdAt))}
            </p>
          </div>

          {/* Account Status */}
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: "rgba(29, 185, 192, 0.1)" }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--stormy-teal)" }}
            >
              ACCOUNT STATUS
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: "#10b981" }}
            >
              ✓ Active
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        currentName={name}
      />
    </>
  )
}
