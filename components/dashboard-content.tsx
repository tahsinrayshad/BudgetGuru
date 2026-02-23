"use client"

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const spendingData = [
  { month: "Jul", income: 5200, expenses: 3100 },
  { month: "Aug", income: 5400, expenses: 3400 },
  { month: "Sep", income: 4900, expenses: 2900 },
  { month: "Oct", income: 5800, expenses: 3600 },
  { month: "Nov", income: 5300, expenses: 4100 },
  { month: "Dec", income: 6200, expenses: 3800 },
  { month: "Jan", income: 5900, expenses: 3200 },
  { month: "Feb", income: 6100, expenses: 3500 },
]

const budgets = [
  { name: "Groceries", spent: 420, total: 600, color: "bg-blue-500" },
  { name: "Dining Out", spent: 180, total: 200, color: "bg-purple-500" },
  { name: "Transportation", spent: 120, total: 300, color: "bg-green-500" },
  { name: "Entertainment", spent: 95, total: 150, color: "bg-orange-500" },
]

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Balance
            </CardTitle>
            <DollarSign className="size-4" style={{ color: "var(--mauve-bark)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--mauve-bark)" }}>
              $24,563.00
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" style={{ color: "#8CE77F" }} />
              <span className="text-xs" style={{ color: "#8CE77F" }}>
                +12.5%
              </span>
              <span className="text-xs text-gray-600">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Monthly Income
            </CardTitle>
            <TrendingUp className="size-4" style={{ color: "#8CE77F" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#8CE77F" }}>
              $6,100.00
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" style={{ color: "#8CE77F" }} />
              <span className="text-xs" style={{ color: "#8CE77F" }}>
                +3.2%
              </span>
              <span className="text-xs text-gray-600">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Monthly Expenses
            </CardTitle>
            <CreditCard className="size-4" style={{ color: "#F45D5D" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#F45D5D" }}>
              $3,500.00
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="size-3" style={{ color: "#F45D5D" }} />
              <span className="text-xs" style={{ color: "#F45D5D" }}>
                +8.1%
              </span>
              <span className="text-xs text-gray-600">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Savings Goal
            </CardTitle>
            <PiggyBank className="size-4" style={{ color: "var(--dusty-taupe)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--dusty-taupe)" }}>
              $8,200.00
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Activity className="size-3" style={{ color: "var(--dusty-taupe)" }} />
              <span className="text-xs" style={{ color: "var(--dusty-taupe)" }}>
                68%
              </span>
              <span className="text-xs text-gray-600">of $12,000 goal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: "var(--mauve-bark)" }}>
            Budget Progress
          </CardTitle>
          <CardDescription className="text-gray-600">Track your monthly spending limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {budgets.map((budget) => (
              <div key={budget.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {budget.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    ${budget.spent} / ${budget.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${budget.color}`}
                    style={{
                      width: `${(budget.spent / budget.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Transactions and Budgets tabs */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "var(--mauve-bark)" }}>More Content Coming Soon</CardTitle>
          <CardDescription className="text-gray-600">
            Transactions, Budgets, and Loans tabs will be implemented next
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
