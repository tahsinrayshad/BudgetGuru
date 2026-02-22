export type AnalyticsPeriod = "all-time" | "this-month" | "last-month" | "this-year";

// Income vs Expense Breakdown
export interface BreakdownCategory {
  total: number;
  count: number;
  average: number;
  percentage: number;
}

export interface IncomeVsExpenseAnalysis {
  success: boolean;
  message: string;
  period: AnalyticsPeriod;
  dateRange: {
    from: string;
    to: string;
  };
  breakdown: {
    income: BreakdownCategory;
    expense: BreakdownCategory;
    netCashFlow: number;
    savingsRate: number;
  };
}

// Spending Distribution by Type
export interface DistributionByType {
  [key: string]: BreakdownCategory;
}

export interface SpendingDistribution {
  success: boolean;
  message: string;
  period: AnalyticsPeriod;
  dateRange: {
    from: string;
    to: string;
  };
  distribution: DistributionByType;
  totalTransactions: number;
  totalAmount: number;
}

// Time-based Analytics
export interface TimeBasedTrend {
  week?: string;
  date?: string;
  month?: string;
  income: number;
  expense: number;
  loan: number;
  netCashFlow: number;
  transactionCount: number;
}

export interface TimeBasedAnalytics {
  success: boolean;
  message: string;
  period: AnalyticsPeriod;
  dateRange: {
    from: string;
    to: string;
  };
  granularity: "daily" | "weekly" | "monthly";
  trends: TimeBasedTrend[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalLoan: number;
    netCashFlow: number;
    totalTransactions: number;
  };
}

// Category-wise Breakdown
export interface CategoryDetail {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface CategoryWiseBreakdown {
  success: boolean;
  message: string;
  period: AnalyticsPeriod;
  dateRange: {
    from: string;
    to: string;
  };
  categoryBreakdown: {
    expense: CategoryDetail[];
    income: CategoryDetail[];
    loan: CategoryDetail[];
  };
  topExpenseCategory: string | null;
  topIncomeCategory: string | null;
}
