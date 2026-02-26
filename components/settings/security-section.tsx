"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Lock } from "lucide-react"

interface SecuritySectionProps {
  lastLogin?: Date
  onChangePasswordClick: () => void
}

export function SecuritySection({
  lastLogin,
  onChangePasswordClick,
}: SecuritySectionProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card
      className="p-6"
      style={{
        borderColor: "var(--steel-blue)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: "var(--charcoal-blue)" }}
      >
        <Shield className="w-5 h-5 inline mr-2" style={{ color: "var(--stormy-teal)" }} />
        Security
      </h3>

      {/* Last Login */}
      <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: "#f3f4f6" }}>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "var(--charcoal-blue)" }}
        >
          Last Login
        </p>
        <p className="text-sm" style={{ color: "var(--stormy-teal)" }}>
          {formatDate(lastLogin)}
        </p>
      </div>

      {/* Change Password */}
      <div className="mb-6">
        <h4
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--charcoal-blue)" }}
        >
          <Lock className="w-4 h-4 inline mr-2" style={{ color: "var(--stormy-teal)" }} />
          Password
        </h4>
        <p className="text-xs mb-4" style={{ color: "#666" }}>
          Regularly update your password to keep your account secure.
        </p>
        <Button
          onClick={onChangePasswordClick}
          className="w-full"
          style={{
            backgroundColor: "var(--stormy-teal)",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Change Password
        </Button>
      </div>

      {/* 2FA Info */}
      <div
        className="p-3 rounded-md text-sm"
        style={{
          backgroundColor: "#eff6ff",
          borderLeft: "4px solid var(--stormy-teal)",
        }}
      >
        <p style={{ color: "var(--charcoal-blue)" }}>
          <span className="font-medium">💡 Tip:</span> Two-factor authentication
          is coming soon to add an extra layer of security to your account.
        </p>
      </div>
    </Card>
  )
}
