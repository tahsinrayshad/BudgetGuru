"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteBudgetModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
  budgetTitle: string
}

export function DeleteBudgetModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
  budgetTitle,
}: DeleteBudgetModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-4 sm:p-0">
        <div
          className="rounded-lg border shadow-lg animate-in fade-in zoom-in duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "var(--steel-blue)",
          }}
        >
          {/* Icon and Title */}
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div
                className="flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#fee2e2" }}
              >
                <Trash2 className="size-6" style={{ color: "#ef4444" }} />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
              Delete Budget
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--stormy-teal)" }}>
              Are you sure you want to delete <span className="font-semibold">"{budgetTitle}"</span>? This action cannot be undone.
            </p>
          </div>

          {/* Buttons */}
          <div
            className="flex gap-3 p-6 border-t"
            style={{ borderColor: "var(--steel-blue)" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
              style={{
                backgroundColor: "#ef4444",
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
