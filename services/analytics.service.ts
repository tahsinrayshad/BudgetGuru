import { prisma } from "@/lib/prisma-client";
import {
  AnalyticsPeriod,
  IncomeVsExpenseAnalysis,
  SpendingDistribution,
  TimeBasedAnalytics,
  CategoryWiseBreakdown,
  BreakdownCategory,
  TimeBasedTrend,
  CategoryDetail,
} from "@/types/analytics";

// Helper function to calculate date range based on period
function getDateRange(period: AnalyticsPeriod): { from: Date; to: Date } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  let from: Date;
  let to: Date = new Date();

  switch (period) {
    case "this-month":
      from = new Date(currentYear, currentMonth, 1);
      to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      break;
    case "last-month":
      from = new Date(currentYear, currentMonth - 1, 1);
      to = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      break;
    case "this-year":
      from = new Date(currentYear, 0, 1);
      to = new Date(currentYear, 11, 31, 23, 59, 59);
      break;
    case "all-time":
    default:
      from = new Date("1970-01-01");
      to = new Date();
      break;
  }

  return { from, to };
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to calculate percentage
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

export async function getIncomeVsExpenseAnalysis(
  userId: string,
  period: AnalyticsPeriod
): Promise<IncomeVsExpenseAnalysis> {
  try {
    const { from, to } = getDateRange(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: from,
          lte: to,
        },
      },
    });

    const incomeTransactions = transactions.filter((t) => t.type === "INCOME");
    const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalAmount = totalIncome + totalExpense;

    const netCashFlow = totalIncome - totalExpense;
    const savingsRate = totalIncome === 0 ? 0 : calculatePercentage(netCashFlow, totalIncome);

    return {
      success: true,
      message: "Income vs expense analysis retrieved",
      period,
      dateRange: {
        from: formatDate(from),
        to: formatDate(to),
      },
      breakdown: {
        income: {
          total: totalIncome,
          count: incomeTransactions.length,
          average: incomeTransactions.length === 0 ? 0 : totalIncome / incomeTransactions.length,
          percentage: calculatePercentage(totalIncome, totalAmount),
        },
        expense: {
          total: totalExpense,
          count: expenseTransactions.length,
          average: expenseTransactions.length === 0 ? 0 : totalExpense / expenseTransactions.length,
          percentage: calculatePercentage(totalExpense, totalAmount),
        },
        netCashFlow,
        savingsRate,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch income vs expense analysis",
      period,
      dateRange: { from: "", to: "" },
      breakdown: {
        income: { total: 0, count: 0, average: 0, percentage: 0 },
        expense: { total: 0, count: 0, average: 0, percentage: 0 },
        netCashFlow: 0,
        savingsRate: 0,
      },
    };
  }
}

export async function getSpendingDistribution(
  userId: string,
  period: AnalyticsPeriod
): Promise<SpendingDistribution> {
  try {
    const { from, to } = getDateRange(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: from,
          lte: to,
        },
      },
    });

    const distribution: { [key: string]: BreakdownCategory } = {
      INCOME: { total: 0, count: 0, average: 0, percentage: 0 },
      EXPENSE: { total: 0, count: 0, average: 0, percentage: 0 },
      LOAN: { total: 0, count: 0, average: 0, percentage: 0 },
    };

    let totalAmount = 0;

    transactions.forEach((t) => {
      distribution[t.type].total += t.amount;
      distribution[t.type].count += 1;
      totalAmount += t.amount;
    });

    Object.keys(distribution).forEach((type) => {
      if (distribution[type].count > 0) {
        distribution[type].average = distribution[type].total / distribution[type].count;
      }
      distribution[type].percentage = calculatePercentage(
        distribution[type].total,
        totalAmount
      );
    });

    return {
      success: true,
      message: "Spending distribution retrieved",
      period,
      dateRange: {
        from: formatDate(from),
        to: formatDate(to),
      },
      distribution,
      totalTransactions: transactions.length,
      totalAmount,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch spending distribution",
      period,
      dateRange: { from: "", to: "" },
      distribution: {
        INCOME: { total: 0, count: 0, average: 0, percentage: 0 },
        EXPENSE: { total: 0, count: 0, average: 0, percentage: 0 },
        LOAN: { total: 0, count: 0, average: 0, percentage: 0 },
      },
      totalTransactions: 0,
      totalAmount: 0,
    };
  }
}

export async function getTimeBasedAnalytics(
  userId: string,
  period: AnalyticsPeriod
): Promise<TimeBasedAnalytics> {
  try {
    const { from, to } = getDateRange(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { transactionDate: "asc" },
    });

    // Determine granularity based on period
    let granularity: "daily" | "weekly" | "monthly" = "weekly";
    if (period === "all-time" || period === "this-year") {
      granularity = "monthly";
    } else if (period === "this-month" || period === "last-month") {
      granularity = "daily";
    }

    // Group transactions by time period
    const trendsMap: { [key: string]: TimeBasedTrend } = {};

    transactions.forEach((t) => {
      let key: string;
      const date = new Date(t.transactionDate);

      if (granularity === "daily") {
        key = formatDate(date);
      } else if (granularity === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        key = `Week ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`;
      } else {
        key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }

      if (!trendsMap[key]) {
        trendsMap[key] = {
          income: 0,
          expense: 0,
          loan: 0,
          netCashFlow: 0,
          transactionCount: 0,
        };
        if (granularity === "daily") trendsMap[key].date = key;
        else if (granularity === "weekly") trendsMap[key].week = key;
        else trendsMap[key].month = key;
      }

      if (t.type === "INCOME") {
        trendsMap[key].income += t.amount;
      } else if (t.type === "EXPENSE") {
        trendsMap[key].expense += t.amount;
      } else if (t.type === "LOAN") {
        trendsMap[key].loan += t.amount;
      }

      trendsMap[key].transactionCount += 1;
      trendsMap[key].netCashFlow = trendsMap[key].income - trendsMap[key].expense;
    });

    const trends = Object.values(trendsMap);

    // Calculate summary
    const summary = {
      totalIncome: trends.reduce((sum, t) => sum + t.income, 0),
      totalExpense: trends.reduce((sum, t) => sum + t.expense, 0),
      totalLoan: trends.reduce((sum, t) => sum + t.loan, 0),
      netCashFlow: 0,
      totalTransactions: transactions.length,
    };

    summary.netCashFlow = summary.totalIncome - summary.totalExpense;

    return {
      success: true,
      message: "Time-based analytics retrieved",
      period,
      dateRange: {
        from: formatDate(from),
        to: formatDate(to),
      },
      granularity,
      trends,
      summary,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch time-based analytics",
      period,
      dateRange: { from: "", to: "" },
      granularity: "weekly",
      trends: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        totalLoan: 0,
        netCashFlow: 0,
        totalTransactions: 0,
      },
    };
  }
}

export async function getCategoryWiseBreakdown(
  userId: string,
  period: AnalyticsPeriod
): Promise<CategoryWiseBreakdown> {
  try {
    const { from, to } = getDateRange(period);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: from,
          lte: to,
        },
      },
    });

    // Group by category and type
    const categoryMap: { [type: string]: { [category: string]: { total: number; count: number } } } = {
      INCOME: {},
      EXPENSE: {},
      LOAN: {},
    };

    transactions.forEach((t) => {
      const category = t.category || "General";
      if (!categoryMap[t.type][category]) {
        categoryMap[t.type][category] = { total: 0, count: 0 };
      }
      categoryMap[t.type][category].total += t.amount;
      categoryMap[t.type][category].count += 1;
    });

    // Format category breakdown
    const formatCategories = (typeData: { [category: string]: { total: number; count: number } }): CategoryDetail[] => {
      const categories: CategoryDetail[] = [];
      let typeTotal = 0;

      Object.entries(typeData).forEach(([category, data]) => {
        typeTotal += data.total;
      });

      Object.entries(typeData).forEach(([category, data]) => {
        categories.push({
          category,
          total: data.total,
          count: data.count,
          percentage: calculatePercentage(data.total, typeTotal),
        });
      });

      return categories.sort((a, b) => b.total - a.total);
    };

    const expenseCategories = formatCategories(categoryMap.EXPENSE);
    const incomeCategories = formatCategories(categoryMap.INCOME);
    const loanCategories = formatCategories(categoryMap.LOAN);

    return {
      success: true,
      message: "Category-wise breakdown retrieved",
      period,
      dateRange: {
        from: formatDate(from),
        to: formatDate(to),
      },
      categoryBreakdown: {
        expense: expenseCategories,
        income: incomeCategories,
        loan: loanCategories,
      },
      topExpenseCategory: expenseCategories.length > 0 ? expenseCategories[0].category : null,
      topIncomeCategory: incomeCategories.length > 0 ? incomeCategories[0].category : null,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch category-wise breakdown",
      period,
      dateRange: { from: "", to: "" },
      categoryBreakdown: {
        expense: [],
        income: [],
        loan: [],
      },
      topExpenseCategory: null,
      topIncomeCategory: null,
    };
  }
}
