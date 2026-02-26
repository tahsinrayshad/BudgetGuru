"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Trash2 } from "lucide-react"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"

interface DataManagementSectionProps {
  onDeleteAccountClick: () => void
}

export function DataManagementSection({
  onDeleteAccountClick,
}: DataManagementSectionProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/export-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const data = await response.json()

      // Create and download JSON file
      const element = document.createElement("a")
      const file = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      element.href = URL.createObjectURL(file)
      element.download = `budgetguru-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      toast.success("Data exported successfully!")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export data"
      )
    } finally {
      setIsExporting(false)
    }
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
        Data Management
      </h3>

      {/* Export Data */}
      <div className="mb-6">
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--charcoal-blue)" }}
        >
          <Download className="w-4 h-4 inline mr-2" style={{ color: "var(--stormy-teal)" }} />
          Export Your Data
        </h4>
        <p className="text-xs mb-4" style={{ color: "#666" }}>
          Download all your data including budgets, transactions, and loans in
          JSON format.
        </p>
        <Button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full"
          style={{
            backgroundColor: "var(--dark-teal)",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          {isExporting ? "Exporting..." : "Export as JSON"}
        </Button>
      </div>

      {/* Delete Account */}
      <div>
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: "#ef4444" }}
        >
          <Trash2 className="w-4 h-4 inline mr-2" />
          Delete Account
        </h4>
        <p className="text-xs mb-4" style={{ color: "#666" }}>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button
          onClick={onDeleteAccountClick}
          className="w-full"
          style={{
            backgroundColor: "#ef4444",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Delete Account
        </Button>
      </div>
    </Card>
  )
}
