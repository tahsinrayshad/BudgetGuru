"use client"

import { useEffect, useState } from "react"
import { X, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"

interface AddBudgetDialogProps {
  isOpen: boolean
  onClose: () => void
  onBudgetAdded: () => void
}

export function AddBudgetDialog({ isOpen, onClose, onBudgetAdded }: AddBudgetDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isOpen) {
      setTitle("")
      setDescription("")
      setAmount("")
      setStartDate("")
      setEndDate("")
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!title.trim()) {
      newErrors.title = "Budget title is required"
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required"
    }
    if (!endDate) {
      newErrors.endDate = "End date is required"
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date"
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

      const response = await fetch(`${window.location.origin}/api/budgets`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          amount: parseFloat(amount),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: "active",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create budget")
      }

      toast.success("Budget created successfully!")
      onBudgetAdded()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create budget")
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
            <h2 className="text-lg font-semibold" style={{ color: "var(--charcoal-blue)" }}>
              Add Budget
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--charcoal-blue)" }}>
                Budget Title
              </label>
              <Input
                type="text"
                placeholder="e.g., Monthly Groceries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full"
                style={{
                  borderColor: errors.title ? "#ef4444" : "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              />
              {errors.title && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--charcoal-blue)" }}>
                Description (Optional)
              </label>
              <textarea
                placeholder="Add notes about this budget..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 rounded-md border resize-none"
                style={{
                  borderColor: "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--charcoal-blue)" }}>
                Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
                className="w-full"
                style={{
                  borderColor: errors.amount ? "#ef4444" : "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              />
              {errors.amount && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--charcoal-blue)" }}>
                Start Date
              </label>
              <Calendar
                value={startDate}
                onChange={setStartDate}
              />
              {errors.startDate && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--charcoal-blue)" }}>
                End Date
              </label>
              <Calendar
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
              />
              {errors.endDate && (
                <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                  {errors.endDate}
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
                className="flex-1 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--stormy-teal)",
                  color: "#FFFFFF",
                  border: "none",
                }}
              >
                {isLoading && <Loader className="size-4 animate-spin" />}
                {isLoading ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
