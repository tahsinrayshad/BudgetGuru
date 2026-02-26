"use client"

import { useEffect, useState } from "react"
import { 
  Plus, ShoppingCart, Utensils, Car, Zap, Film, Briefcase, MoreVertical,
  Heart, Home, Pill, BookOpen, Gamepad2, Coffee, Plane, Smartphone, GraduationCap,
  Dumbbell, Palette, Wrench, Leaf, Edit, Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AddBudgetDialog } from "@/components/dialogs/add-budget-dialog"
import { EditBudgetDialog } from "@/components/dialogs/edit-budget-dialog"
import { DeleteBudgetModal } from "@/components/dialogs/delete-budget-modal"
import { authUtils } from "@/lib/auth-client"
import { API_CONFIG } from "@/lib/api-config"
import { getCurrencySymbol } from "@/lib/currency"
import { toast } from "sonner"

interface ApiBudget {
  id: string
  title: string
  amount: number
  description: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string
  transactions: any[]
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
}

function getCategoryIcon(title: string, description: string = "") {
  // Combine title and description for analysis
  const text = `${title} ${description}`.toLowerCase()

  // Define keyword patterns for each icon
  const iconPatterns: { [key: string]: { keywords: string[], icon: any } } = {
    ShoppingCart: { 
      keywords: ["grocery", "groceries", "shop", "shopping", "market", "supermarket", "mall"],
      icon: ShoppingCart 
    },
    Utensils: { 
      keywords: ["dining", "restaurant", "eat", "meal", "lunch", "dinner", "food", "cafe"],
      icon: Utensils 
    },
    Car: { 
      keywords: ["transport", "car", "drive", "gas", "fuel", "travel", "taxi", "auto", "vehicle", "parking"],
      icon: Car 
    },
    Zap: { 
      keywords: ["utilities", "electric", "electricity", "power", "water", "internet", "utility", "bill"],
      icon: Zap 
    },
    Film: { 
      keywords: ["entertainment", "movie", "cinema", "game", "play", "show", "concert", "sport"],
      icon: Film 
    },
    Briefcase: { 
      keywords: ["business", "work", "office", "professional", "company", "project"],
      icon: Briefcase 
    },
    Heart: { 
      keywords: ["health", "medicine", "doctor", "hospital", "medical", "dental", "pharmacy"],
      icon: Heart 
    },
    Home: { 
      keywords: ["rent", "housing", "home", "apartment", "mortgage", "household", "furniture"],
      icon: Home 
    },
    Pill: { 
      keywords: ["healthcare", "medicine", "medication", "drug", "supplement"],
      icon: Pill 
    },
    BookOpen: { 
      keywords: ["education", "school", "book", "learn", "course", "study", "tuition"],
      icon: BookOpen 
    },
    Gamepad2: { 
      keywords: ["gaming", "game", "playstation", "xbox", "video game"],
      icon: Gamepad2 
    },
    Coffee: { 
      keywords: ["coffee", "drink", "beverage", "cafe", "tea", "espresso"],
      icon: Coffee 
    },
    Plane: { 
      keywords: ["travel", "flight", "vacation", "trip", "airline", "hotel"],
      icon: Plane 
    },
    Smartphone: { 
      keywords: ["phone", "mobile", "cellular", "telecom", "internet", "subscription"],
      icon: Smartphone 
    },
    Dumbbell: { 
      keywords: ["fitness", "gym", "exercise", "workout", "sport", "training", "health"],
      icon: Dumbbell 
    },
    Palette: { 
      keywords: ["art", "hobby", "creative", "craft", "design", "music"],
      icon: Palette 
    },
    Wrench: { 
      keywords: ["maintenance", "repair", "service", "auto repair", "plumber"],
      icon: Wrench 
    },
    Leaf: { 
      keywords: ["eco", "green", "organic", "natural", "sustainable"],
      icon: Leaf 
    },
  }

  // Find matching icon based on keywords
  for (const [key, pattern] of Object.entries(iconPatterns)) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return pattern.icon
    }
  }

  // Default to ShoppingCart if no match
  return ShoppingCart
}

function getProgressColor(percent: number) {
  if (percent >= 90) return "#ef4444"
  if (percent >= 70) return "#f59e0b"
  return "#10b981"
}

export function BudgetsContent() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [allBudgetsData, setAllBudgetsData] = useState<ApiBudget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddBudgetDialogOpen, setIsAddBudgetDialogOpen] = useState(false)
  const [isEditBudgetDialogOpen, setIsEditBudgetDialogOpen] = useState(false)
  const [isDeleteBudgetModalOpen, setIsDeleteBudgetModalOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("")
  const [isDeletingBudget, setIsDeletingBudget] = useState(false)
  const [currency, setCurrency] = useState<string>("USD")

  useEffect(() => {
    fetchUserPreferences()
    fetchBudgets()
  }, [])

  const fetchUserPreferences = async () => {
    try {
      const token = authUtils.getToken()
      if (!token) return

      const response = await fetch(
        `${window.location.origin}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCurrency(data.currency || "USD")
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error)
      setCurrency("USD")
    }
  }

  const fetchBudgets = async () => {
    try {
      setIsLoading(true)
      const token = authUtils.getToken()

      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.BUDGETS), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch budgets")
      }

      // Transform API data to component format
      const transformedBudgets: Budget[] = (data.budgets || []).map((budget: ApiBudget) => ({
        id: budget.id,
        category: budget.title,
        limit: budget.amount,
        spent: budget.transactions.reduce((sum: number, tx: any) => {
          // Calculate spent from transactions if available
          return sum + (tx.amount || 0)
        }, 0)
      }))

      setBudgets(transformedBudgets)
      setAllBudgetsData(data.budgets || [])
      setError(null)
    } catch (err) {
      console.error("Failed to fetch budgets:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch budgets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = (budgetId: string) => {
    setSelectedBudgetId(budgetId)
    setIsDeleteBudgetModalOpen(true)
  }

  const confirmDeleteBudget = async () => {
    if (!selectedBudgetId) return

    setIsDeletingBudget(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(`${window.location.origin}/api/budgets/${selectedBudgetId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete budget")
      }

      toast.success("Budget deleted successfully!")
      setIsDeleteBudgetModalOpen(false)
      setSelectedBudgetId("")
      fetchBudgets()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete budget")
    } finally {
      setIsDeletingBudget(false)
    }
  }

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
  const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0
  const remaining = totalLimit - totalSpent

  // Filter budgets for current month
  const getCurrentMonthBudgets = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

    return allBudgetsData.filter((budget) => {
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)
      // Include if budget overlaps with current month
      return startDate <= lastDayOfMonth && endDate >= firstDayOfMonth
    })
  }

  // Calculate monthly budget totals (current month only)
  const currentMonthBudgets = getCurrentMonthBudgets()
  const monthlyBudgetSpent = currentMonthBudgets.reduce((sum, b) => {
    return sum + (b.transactions.reduce((txSum: number, tx: any) => txSum + (tx.amount || 0), 0))
  }, 0)
  const monthlyBudgetLimit = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0)
  const monthlyPercent = monthlyBudgetLimit > 0 ? Math.round((monthlyBudgetSpent / monthlyBudgetLimit) * 100) : 0
  const monthlyRemaining = monthlyBudgetLimit - monthlyBudgetSpent

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading budgets..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              February Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
              {getCurrencySymbol(currency)}{monthlyBudgetLimit.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              February Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
              {getCurrencySymbol(currency)}{monthlyBudgetSpent.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span 
              className="text-2xl font-bold"
              style={{ color: monthlyRemaining >= 0 ? "#10b981" : "#ef4444" }}
            >
              {getCurrencySymbol(currency)}{Math.abs(monthlyRemaining).toLocaleString()}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
              February Budget
            </CardTitle>
            <CardDescription>{monthlyPercent}% of monthly budget used</CardDescription>
          </div>
          <Button 
            size="sm" 
            className="h-8 w-full sm:w-auto"
            onClick={() => setIsAddBudgetDialogOpen(true)}
            style={{ 
              backgroundColor: "var(--stormy-teal)",
              color: "#FFFFFF",
              border: "none"
            }}
          >
            <Plus className="size-4 mr-1.5" />
            Add Budget
          </Button>
        </CardHeader>
        <CardContent>
          <div 
            className="h-3 mb-2 rounded-full overflow-hidden bg-gray-200"
            style={{ backgroundColor: "var(--steel-blue)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(monthlyPercent, 100)}%`,
                backgroundColor: "var(--dark-teal)",
              }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
            {getCurrencySymbol(currency)}{monthlyBudgetSpent.toLocaleString()} of {getCurrencySymbol(currency)}{monthlyBudgetLimit.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const percent = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0
            const budgetRemaining = budget.limit - budget.spent
            const statusColor = getProgressColor(percent)
            
            // Find the original API budget data for dates and description
            const originalBudget = allBudgetsData.find(b => b.id === budget.id)
            const startDate = originalBudget ? new Date(originalBudget.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""
            const endDate = originalBudget ? new Date(originalBudget.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""
            const description = originalBudget?.description || ""
            
            // Get icon based on title and description
            const Icon = getCategoryIcon(budget.category, description)

            return (
              <Card key={budget.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex size-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "var(--steel-blue)" }}
                      >
                        <Icon className="size-5" style={{ color: "var(--stormy-teal)" }} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                          {budget.category}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getCurrencySymbol(currency)}{budget.spent} of {getCurrencySymbol(currency)}{budget.limit}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: statusColor }}>
                      {percent}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className="h-2 mb-2 rounded-full overflow-hidden bg-gray-200"
                    style={{ backgroundColor: "var(--steel-blue)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: "var(--dark-teal)",
                      }}
                    />
                  </div>
                  
                  <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                    {budgetRemaining > 0
                      ? `${getCurrencySymbol(currency)}${budgetRemaining} remaining`
                      : `${getCurrencySymbol(currency)}${Math.abs(budgetRemaining)} over budget`}
                  </p>

                  {/* Budget Period */}
                  <div className="pt-2 border-t" style={{ borderColor: "var(--steel-blue)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
                      Period
                    </p>
                    <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                      {startDate} - {endDate}
                    </p>
                  </div>

                  {/* Budget Description */}
                  {description && (
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "var(--charcoal-blue)" }}>
                        Details
                      </p>
                      <p className="text-xs" style={{ color: "var(--ink-black)" }}>
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 mt-3 border-t flex justify-end gap-2" style={{ borderColor: "var(--steel-blue)" }}>
                    <button
                      onClick={() => {
                        setSelectedBudgetId(budget.id)
                        setIsEditBudgetDialogOpen(true)
                      }}
                      className="p-2 hover:bg-gray-100 rounded-md transition"
                      title="Edit budget"
                    >
                      <Edit className="size-4" style={{ color: "var(--stormy-teal)" }} />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 hover:bg-gray-100 rounded-md transition"
                      title="Delete budget"
                    >
                      <Trash2 className="size-4" style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-8">
              <p className="text-center" style={{ color: "var(--stormy-teal)" }}>
                No budgets yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-center" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      <AddBudgetDialog 
        isOpen={isAddBudgetDialogOpen}
        onClose={() => setIsAddBudgetDialogOpen(false)}
        onBudgetAdded={fetchBudgets}
      />

      {/* Get selected budget data for editing */}
      {(() => {
        const selectedBudget = allBudgetsData.find(b => b.id === selectedBudgetId)
        return selectedBudget ? (
          <EditBudgetDialog
            isOpen={isEditBudgetDialogOpen}
            onClose={() => {
              setIsEditBudgetDialogOpen(false)
              setSelectedBudgetId("")
            }}
            onBudgetUpdated={fetchBudgets}
            budgetId={selectedBudget.id}
            budgetTitle={selectedBudget.title}
            budgetAmount={selectedBudget.amount}
            budgetDescription={selectedBudget.description}
            budgetStartDate={selectedBudget.startDate.split("T")[0]}
            budgetEndDate={selectedBudget.endDate.split("T")[0]}
          />
        ) : null
      })()}

      {/* Get selected budget title for delete confirmation */}
      {(() => {
        const selectedBudget = allBudgetsData.find(b => b.id === selectedBudgetId)
        return selectedBudget ? (
          <DeleteBudgetModal
            isOpen={isDeleteBudgetModalOpen}
            onConfirm={confirmDeleteBudget}
            onCancel={() => {
              setIsDeleteBudgetModalOpen(false)
              setSelectedBudgetId("")
            }}
            isLoading={isDeletingBudget}
            budgetTitle={selectedBudget.title}
          />
        ) : null
      })()}
    </div>
  )
}
