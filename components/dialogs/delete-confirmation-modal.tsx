"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
  title?: string
  description?: string
}

export function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
  title = "Delete Transaction",
  description = "Are you sure you want to delete this transaction? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Blur backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 pointer-events-auto border-2 dialog-animate" style={{ borderColor: "var(--stormy-teal)" }}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <Trash2 className="size-6" style={{ color: "#ef4444" }} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--charcoal-blue)" }}>
            {title}
          </h2>

          {/* Description */}
          <p className="text-center text-sm mb-6" style={{ color: "var(--dark-teal)" }}>
            {description}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
              style={{
                backgroundColor: "var(--steel-blue)",
                color: "#FFFFFF",
                border: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
              style={{
                backgroundColor: isLoading ? "var(--steel-blue)" : "#ef4444",
                color: "#FFFFFF",
                border: "none",
              }}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
