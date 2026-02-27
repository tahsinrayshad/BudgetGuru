import { prisma } from "@/lib/prisma-client"

export interface DashboardMetrics {
  totalIncome: number
  totalExpenses: number
  totalAssets: number
  totalDebt: number
  totalLent: number
  netBalance: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

export interface BudgetData {
  name: string
  spent: number
  budget: number
}

export interface CategorySpending {
  name: string
  amount: number
  percentage: number
}

export interface UpcomingDeadline {
  id: string
  type: "Loan Payment" | "Budget End"
  description: string
  dueDate: string
  daysLeft: number
  priority: "high" | "medium" | "low"
}

export interface RecentActivity {
  id: string
  type: "income" | "expense" | "loan" | "budget"
  description: string
  amount: number | null
  date: string
  category: string
}

export interface DashboardData {
  metrics: DashboardMetrics
  monthlyTrends: MonthlyTrend[]
  budgetData: BudgetData[]
  categorySpending: CategorySpending[]
  upcomingDeadlines: UpcomingDeadline[]
  recentActivity: RecentActivity[]
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" })
}

function getDaysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatActivityDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - target.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getDateRange(timeRange: "week" | "month" | "quarter" | "year"): { from: Date; to: Date } {
  const now = new Date()
  const from = new Date()
  
  switch (timeRange) {
    case "week":
      from.setDate(now.getDate() - 7)
      break
    case "month":
      from.setMonth(now.getMonth() - 1)
      break
    case "quarter":
      from.setMonth(now.getMonth() - 3)
      break
    case "year":
      from.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return { from, to: now }
}

export async function getDashboardData(userId: string, timeRange: "week" | "month" | "quarter" | "year" = "month"): Promise<DashboardData> {
  try {
    const { from, to } = getDateRange(timeRange)
    
    // Fetch all necessary data in parallel
    const [transactions, budgets, loans, user] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { transactionDate: "desc" },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: {
          transactions: {
            where: {
              transactionDate: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
              },
            },
          },
        },
      }),
      prisma.loan.findMany({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ])

    // Calculate metrics
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const currentMonthTransactions = transactions.filter(
      (t) => t.transactionDate >= currentMonth && t.transactionDate < nextMonth
    )

    const incomeTransactions = currentMonthTransactions.filter((t) => t.type === "INCOME")
    const expenseTransactions = currentMonthTransactions.filter((t) => t.type === "EXPENSE")

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate total assets (cumulative net from all transactions)
    const allIncomeTotal = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const allExpenseTotal = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalAssets = allIncomeTotal - allExpenseTotal

    // Calculate debt and lent
    const totalDebt = loans
      .filter((l) => l.type === "BORROWED" && !l.isPaid)
      .reduce((sum, l) => sum + l.amount, 0)

    const totalLent = loans
      .filter((l) => l.type === "LENT" && !l.isPaid)
      .reduce((sum, l) => sum + l.amount, 0)

    const netBalance = totalIncome - totalExpenses

    const metrics: DashboardMetrics = {
      totalIncome,
      totalExpenses,
      totalAssets,
      totalDebt,
      totalLent,
      netBalance,
    }

    // Calculate monthly trends based on time range
    const monthlyTrends: MonthlyTrend[] = []
    
    if (timeRange === "week") {
      // Show daily trends for the week
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now)
        dayStart.setDate(now.getDate() - i)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setHours(23, 59, 59, 999)

        const dayTransactions = transactions.filter(
          (t) => t.transactionDate >= dayStart && t.transactionDate <= dayEnd
        )

        const dayIncome = dayTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0)

        const dayExpense = dayTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyTrends.push({
          month: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          income: dayIncome,
          expenses: dayExpense,
        })
      }
    } else if (timeRange === "year") {
      // Show monthly trends for the year
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const monthTransactions = transactions.filter(
          (t) => t.transactionDate >= monthStart && t.transactionDate <= monthEnd
        )

        const monthIncome = monthTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0)

        const monthExpense = monthTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyTrends.push({
          month: getMonthName(monthStart),
          income: monthIncome,
          expenses: monthExpense,
        })
      }
    } else {
      // Show monthly trends for month and quarter
      const months = timeRange === "month" ? 1 : 3
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const monthTransactions = transactions.filter(
          (t) => t.transactionDate >= monthStart && t.transactionDate <= monthEnd
        )

        const monthIncome = monthTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + t.amount, 0)

        const monthExpense = monthTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyTrends.push({
          month: getMonthName(monthStart),
          income: monthIncome,
          expenses: monthExpense,
        })
      }
    }

    // Calculate budget data
    const budgetData: BudgetData[] = budgets.map((budget) => {
      const budgetSpent = budget.transactions.reduce((sum, t) => sum + t.amount, 0)
      return {
        name: budget.title,
        spent: budgetSpent,
        budget: budget.amount,
      }
    })

    // Calculate category spending for current month
    const categoryMap: { [key: string]: { amount: number; transactions: number } } = {}
    expenseTransactions.forEach((t) => {
      const category = t.category || "Others"
      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, transactions: 0 }
      }
      categoryMap[category].amount += t.amount
      categoryMap[category].transactions += 1
    })

    const totalCategoryAmount = Object.values(categoryMap).reduce((sum, c) => sum + c.amount, 0)

    const categorySpending: CategorySpending[] = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: Math.round((data.amount / totalCategoryAmount) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)

    // Calculate upcoming deadlines
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingDeadlines: UpcomingDeadline[] = []

    // Add upcoming loan payments
    loans
      .filter((l) => !l.isPaid && l.deadline)
      .forEach((loan) => {
        const daysLeft = getDaysUntil(loan.deadline)
        if (daysLeft >= 0 && daysLeft <= 60) {
          // Only show upcoming within 60 days
          upcomingDeadlines.push({
            id: loan.id,
            type: "Loan Payment",
            description: `${loan.type === "BORROWED" ? "Pay back: " : "Collect: "}${loan.description || "Loan"}`,
            dueDate: formatShortDate(loan.deadline),
            daysLeft,
            priority: daysLeft <= 7 ? "high" : daysLeft <= 30 ? "medium" : "low",
          })
        }
      })

    // Add upcoming budget ends
    budgets
      .filter((b) => new Date(b.endDate) > today)
      .forEach((budget) => {
        const daysLeft = getDaysUntil(new Date(budget.endDate))
        if (daysLeft >= 0 && daysLeft <= 60) {
          upcomingDeadlines.push({
            id: budget.id,
            type: "Budget End",
            description: `${budget.title} Budget Closes`,
            dueDate: formatShortDate(new Date(budget.endDate)),
            daysLeft,
            priority: daysLeft <= 3 ? "high" : "medium",
          })
        }
      })

    upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft).splice(5) // Limit to 5

    // Get recent activity (last 5 transactions)
    const recentActivity: RecentActivity[] = transactions
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        type: t.type === "INCOME" ? "income" : t.type === "EXPENSE" ? "expense" : "loan",
        description: t.description || "Transaction",
        amount: t.amount,
        date: formatActivityDate(t.transactionDate),
        category: t.category || "General",
      }))

    return {
      metrics,
      monthlyTrends,
      budgetData,
      categorySpending,
      upcomingDeadlines,
      recentActivity,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    throw error
  }
}
