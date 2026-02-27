"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { getCurrencySymbol } from "@/lib/currency"
import { authUtils } from "@/lib/auth-client"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  metrics: {
    totalIncome: number
    totalExpenses: number
    totalAssets: number
    totalDebt: number
    totalLent: number
    netBalance: number
  }
  monthlyTrends: Array<{ month: string; income: number; expenses: number }>
  budgetData: Array<{ name: string; spent: number; budget: number }>
  categorySpending: Array<{ name: string; amount: number; percentage: number }>
  upcomingDeadlines: Array<{
    id: string
    type: "Loan Payment" | "Budget End"
    description: string
    dueDate: string
    daysLeft: number
    priority: "high" | "medium" | "low"
  }>
  recentActivity: Array<{
    id: string
    type: "income" | "expense" | "loan" | "budget"
    description: string
    amount: number | null
    date: string
    category: string
  }>
}

export function DashboardContent() {
  const [currency, setCurrency] = useState("USD")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user preferences once on mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const token = authUtils.getToken()
        if (!token) return

        const profileResponse = await fetch(`${window.location.origin}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setCurrency(profileData.currency || "USD")
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error)
      }
    }

    fetchUserPreferences()
  }, [])

  // Fetch dashboard data when timeRange changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const token = authUtils.getToken()
        if (!token) {
          setError("No authentication token")
          return
        }

        // Fetch dashboard data with time range parameter
        const dashboardResponse = await fetch(
          `${window.location.origin}/api/dashboard?timeRange=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (dashboardResponse.ok) {
          const result = await dashboardResponse.json()
          if (result.success) {
            setDashboardData(result.data)
            setError(null)
          } else {
            setError(result.message || "Failed to load dashboard data")
          }
        } else {
          setError("Failed to fetch dashboard data")
        }
      } catch (err) {
        console.error("Dashboard error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <div
              className="size-8 rounded-full border-4 border-gray-200 animate-spin"
              style={{ borderTopColor: "var(--stormy-teal)" }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md" style={{ borderColor: "#ef4444" }}>
          <CardHeader>
            <CardTitle style={{ color: "#ef4444" }}>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || "Failed to load dashboard data"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics, monthlyTrends, budgetData, categorySpending, upcomingDeadlines, recentActivity } =
    dashboardData

  // Calculate derived metrics
  const netWorth = metrics.totalAssets + metrics.totalLent - metrics.totalDebt
  const burnRate =
    metrics.totalIncome > 0 ? ((metrics.totalExpenses / metrics.totalIncome) * 100).toFixed(1) : "0"
  const healthScore = Math.min(
    100,
    Math.max(0, Math.round((metrics.netBalance / Math.max(1, metrics.totalIncome)) * 100 + 50))
  )
  const netDebtPosition = metrics.totalLent - metrics.totalDebt

  // Prepare chart data
  const incomeExpenseData = [
    { name: "Income", value: metrics.totalIncome, fill: "var(--stormy-teal)" },
    { name: "Expenses", value: metrics.totalExpenses, fill: "#ef4444" },
  ].filter((item) => item.value > 0)

  // Find budget alerts
  const budgetAlerts = budgetData
    .map((budget) => {
      const progress = (budget.spent / budget.budget) * 100
      return { ...budget, progress }
    })
    .filter((b) => b.progress >= 80)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["week", "month", "quarter", "year"] as const).map((range) => (
          <Button
            key={range}
            size="sm"
            onClick={() => setTimeRange(range)}
            style={{
              backgroundColor: timeRange === range ? "var(--stormy-teal)" : "transparent",
              color: timeRange === range ? "#FFFFFF" : "var(--stormy-teal)",
              borderColor: "var(--stormy-teal)",
              borderWidth: "1px",
            }}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Net Worth
            </CardTitle>
            <DollarSign className="size-4" style={{ color: "var(--stormy-teal)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--stormy-teal)" }}>
              {getCurrencySymbol(currency)}{netWorth.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" style={{ color: "var(--stormy-teal)" }} />
              <span className="text-xs" style={{ color: "var(--stormy-teal)" }}>Calculated</span>
              <span className="text-xs text-gray-600">from your accounts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Monthly Burn Rate
            </CardTitle>
            <TrendingDown className="size-4" style={{ color: "#f59e0b" }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f59e0b" }}>
              {burnRate}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">
                {metrics.totalIncome > 0 ? `${metrics.totalExpenses} of ${metrics.totalIncome}` : "No data"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Financial Health
            </CardTitle>
            <Zap className="size-4" style={{ color: "#10b981" }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#10b981" }}>
              {healthScore}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Progress value={healthScore} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Net Debt Position
            </CardTitle>
            <ArrowDownLeft className="size-4" style={{ color: "#ef4444" }} />
          </CardHeader>
          <CardContent>
            <div
              className="text-xl sm:text-2xl font-bold"
              style={{ color: netDebtPosition >= 0 ? "var(--stormy-teal)" : "#ef4444" }}
            >
              {netDebtPosition >= 0 ? "+" : ""}
              {getCurrencySymbol(currency)}
              {Math.abs(netDebtPosition).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">
                {netDebtPosition >= 0 ? "Others owe you" : "You owe more"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expense Pie Chart */}
        {incomeExpenseData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${getCurrencySymbol(currency)}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) =>
                      `${getCurrencySymbol(currency)}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trends Line Chart */}
        {monthlyTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) =>
                      `${getCurrencySymbol(currency)}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--stormy-teal)"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Budget Utilization & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget vs Actual */}
        {budgetData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                Budget vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) =>
                      `${getCurrencySymbol(currency)}${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    }
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="var(--steel-blue)" name="Budget" />
                  <Bar dataKey="spent" fill="var(--stormy-teal)" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Spending Categories */}
        {categorySpending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {categorySpending.slice(0, 5).map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                        {category.name}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--stormy-teal)" }}>
                        {getCurrencySymbol(currency)}
                        {category.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({category.percentage}%)
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important dates coming up</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    backgroundColor:
                      deadline.priority === "high"
                        ? "#ef44441a"
                        : deadline.priority === "medium"
                        ? "#f59e0b1a"
                        : "#10b9811a",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className="size-4"
                      style={{
                        color:
                          deadline.priority === "high"
                            ? "#ef4444"
                            : deadline.priority === "medium"
                            ? "#f59e0b"
                            : "#10b981",
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                        {deadline.description}
                      </p>
                      <p className="text-xs text-gray-600">{deadline.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--stormy-teal)" }}>
                      {deadline.dueDate}
                    </p>
                    <p className="text-xs text-gray-600">{deadline.daysLeft} days</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor:
                          activity.type === "expense"
                            ? "#ef44441a"
                            : activity.type === "income"
                            ? "#1abc9c1a"
                            : "#3b82f61a",
                      }}
                    >
                      {activity.type === "expense" ? (
                        <ArrowUpRight className="size-4" style={{ color: "#ef4444" }} />
                      ) : activity.type === "income" ? (
                        <ArrowDownLeft className="size-4" style={{ color: "var(--stormy-teal)" }} />
                      ) : (
                        <CreditCard className="size-4" style={{ color: "#3b82f6" }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {activity.category} • {activity.date}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          activity.type === "expense"
                            ? "#ef4444"
                            : activity.type === "income"
                            ? "var(--stormy-teal)"
                            : "#3b82f6",
                      }}
                    >
                      {activity.type === "expense" ? "-" : "+"}
                      {getCurrencySymbol(currency)}
                      {activity.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts */}
      {budgetAlerts.length > 0 && (
        <Card style={{ borderColor: "#ef4444", borderLeft: "4px solid #ef4444" }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--charcoal-blue)" }}>
              <AlertTriangle className="size-5" style={{ color: "#ef4444" }} />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {budgetAlerts.map((budget) => (
              <div key={budget.name} className={`p-3 rounded-lg ${budget.progress >= 100 ? "bg-red-50" : "bg-yellow-50"}`}>
                <p
                  className="text-sm font-medium"
                  style={{ color: budget.progress >= 100 ? "#ef4444" : "#f59e0b" }}
                >
                  Budget Alert: {budget.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  You have spent {getCurrencySymbol(currency)}
                  {budget.spent.toLocaleString("en-US", { maximumFractionDigits: 0 })} of{" "}
                  {getCurrencySymbol(currency)}
                  {budget.budget.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({budget.progress.toFixed(0)}%)
                  {budget.progress < 100
                    ? ` - ${getCurrencySymbol(currency)}${(budget.budget - budget.spent).toLocaleString("en-US", { maximumFractionDigits: 0 })} remaining`
                    : ` - Budget exceeded!`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Savings Goals Progress - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--charcoal-blue)" }}>
            <Target className="size-5" style={{ color: "var(--stormy-teal)" }} />
            Savings Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Create savings goals to track your financial targets</p>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      {categorySpending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
              Spending Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: "#1abc9c15" }}>
              <p className="text-sm font-medium" style={{ color: "var(--stormy-teal)" }}>
                💡 Top Spending Category
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {categorySpending[0]?.name} accounts for {categorySpending[0]?.percentage}% of your spending this month.
              </p>
            </div>
            {metrics.totalIncome > 0 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#f59e0b15" }}>
                <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>
                  💡 Burn Rate Analysis
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {burnRate}% of your income is spent this month.{" "}
                  {parseFloat(burnRate) > 70
                    ? "Consider reducing expenses to increase savings."
                    : "You are maintaining a healthy spending pattern."}
                </p>
              </div>
            )}
            {categorySpending.length > 1 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#3b82f615" }}>
                <p className="text-sm font-medium" style={{ color: "#3b82f6" }}>
                  💡 Spending Trend
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Your top 2 spending categories are {categorySpending[0]?.name} and {categorySpending[1]?.name}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
