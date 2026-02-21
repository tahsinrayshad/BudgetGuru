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

export type BudgetResponse = Omit<Budget, "userId">;

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

export interface BudgetApiResponse {
  success: boolean;
  message: string;
  budget?: BudgetResponse;
  budgets?: BudgetResponse[];
}
