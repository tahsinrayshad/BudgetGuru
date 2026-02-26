"use client"

import { useEffect, useState } from "react"
import { Loader } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authUtils } from "@/lib/auth-client"
import { API_CONFIG } from "@/lib/api-config"

interface Budget {
  id: string
  title: string
}

interface Loan {
  id: string
  description?: string
}

interface AddTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onTransactionAdded: () => void
}

const defaultCategories = ["General", "Income", "Housing", "Food", "Utilities", "Transport", "Entertainment", "Others"]
const transactionTypes = ["INCOME", "EXPENSE", "LOAN"]

export function AddTransactionDialog({ isOpen, onClose, onTransactionAdded }: AddTransactionDialogProps) {
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    description: "",
    category: "General",
    customCategory: "",
    transactionDate: new Date().toISOString().split("T")[0],
    budgetId: "",
    loanId: "",
  })

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // Fetch budgets, loans, and categories
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = authUtils.getToken()
        if (!token) throw new Error("No token found")

        // Fetch categories
        const categoryResponse = await fetch(`${window.location.origin}/api/categories`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const categoryData = await categoryResponse.json()
        if (categoryResponse.ok && categoryData.categories) {
          setCategories([...categoryData.categories, "Others"])
        }

        // Fetch budgets
        const budgetResponse = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.BUDGETS), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const budgetData = await budgetResponse.json()
        if (budgetResponse.ok && budgetData.budgets) {
          setBudgets(budgetData.budgets)
        }

        // Fetch loans
        const loanResponse = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const loanData = await loanResponse.json()
        if (loanResponse.ok && loanData.loans) {
          setLoans(loanData.loans)
        }
      } catch (error) {
        console.error("Failed to fetch options:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      type: e.target.value,
      budgetId: "",
      loanId: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (!formData.transactionDate) {
        throw new Error("Transaction date is required")
      }

      // Determine final category
      let finalCategory = formData.category
      if (formData.category === "Others") {
        if (!formData.customCategory || formData.customCategory.trim() === "") {
          throw new Error("Please enter a custom category")
        }
        finalCategory = formData.customCategory.trim()
      }

      const token = authUtils.getToken()
      if (!token) throw new Error("No token found. Please login first.")

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description || undefined,
          category: finalCategory,
          transactionDate: new Date(formData.transactionDate).toISOString(),
          budgetId: formData.type === "EXPENSE" && formData.budgetId ? formData.budgetId : undefined,
          loanId: formData.type === "LOAN" && formData.loanId ? formData.loanId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add transaction")
      }

      toast.success("Transaction added successfully!")
      setFormData({
        type: "EXPENSE",
        amount: "",
        description: "",
        category: "General",
        customCategory: "",
        transactionDate: new Date().toISOString().split("T")[0],
        budgetId: "",
        loanId: "",
      })
      onClose()
      onTransactionAdded()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add transaction")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Blur backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm z-40" />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md p-4 sm:p-6 pointer-events-auto border-2 dialog-animate" style={{ borderColor: "var(--stormy-teal)" }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--charcoal-blue)" }}>
          Add Transaction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border rounded-md outline-none"
              style={{
                borderColor: "var(--steel-blue)",
                backgroundColor: "#FFFFFF",
                color: "var(--charcoal-blue)",
              }}
            >
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
              Amount *
            </label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className="w-full"
              style={{
                borderColor: "var(--steel-blue)",
                backgroundColor: "#FFFFFF",
                color: "var(--charcoal-blue)",
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
              Description
            </label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
              className="w-full"
              style={{
                borderColor: "var(--steel-blue)",
                backgroundColor: "#FFFFFF",
                color: "var(--charcoal-blue)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md outline-none"
              style={{
                borderColor: "var(--steel-blue)",
                backgroundColor: "#FFFFFF",
                color: "var(--charcoal-blue)",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Category Input (when Others is selected) */}
          {formData.category === "Others" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
                Enter Custom Category *
              </label>
              <Input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="e.g., Shopping, Medical, etc."
                className="w-full"
                style={{
                  borderColor: "var(--stormy-teal)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
                required
              />
            </div>
          )}

          {/* Transaction Date */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "var(--charcoal-blue)" }}>
              Date *
            </label>
            <Calendar
              value={formData.transactionDate}
              onChange={(date) => setFormData((prev) => ({ ...prev, transactionDate: date }))}
            />
          </div>

          {/* Budget (for EXPENSE) */}
          {formData.type === "EXPENSE" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
                Budget (Optional)
              </label>
              <select
                name="budgetId"
                value={formData.budgetId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md outline-none"
                style={{
                  borderColor: "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              >
                <option value="">Select a budget</option>
                {isLoadingOptions ? (
                  <option disabled>Loading budgets...</option>
                ) : (
                  budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Loan (for LOAN) */}
          {formData.type === "LOAN" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
                Loan (Optional)
              </label>
              <select
                name="loanId"
                value={formData.loanId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md outline-none"
                style={{
                  borderColor: "var(--steel-blue)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--charcoal-blue)",
                }}
              >
                <option value="">Select a loan</option>
                {isLoadingOptions ? (
                  <option disabled>Loading loans...</option>
                ) : (
                  loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.description || `Loan ${loan.id.slice(0, 8)}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                backgroundColor: isLoading ? "var(--steel-blue)" : "var(--stormy-teal)",
                color: "#FFFFFF",
                border: "none",
              }}
            >
              {isLoading && <Loader className="size-4 animate-spin" />}
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
