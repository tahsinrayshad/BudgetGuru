export interface Budget {
  id: string;
  userId: string;
  title: string;
  amount: number;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionForBudget {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  category: string;
  transactionDate: Date;
  createdAt: Date;
}

export interface BudgetResponse extends Omit<Budget, "userId"> {
  transactions: TransactionForBudget[];
}

export interface BudgetRequest {
  title: string;
  amount: number;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status?: "active" | "completed" | "cancelled";
}

export interface BudgetUpdateRequest {
  title?: string;
  amount?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "completed" | "cancelled";
}

export interface BudgetPerformance {
  budgetedAmount: number;
  actualSpending: number;
  remaining: number;
  percentageUsed: number;
  status: "on-track" | "warning" | "over-budget";
  transactionCount: number;
  period: string;
}

export interface BudgetPerformanceResponse {
  success: boolean;
  message: string;
  budgetId: string;
  title: string;
  performance: BudgetPerformance;
}

export interface BudgetApiResponse {
  success: boolean;
  message: string;
  budget?: BudgetResponse;
  budgets?: BudgetResponse[];
}
