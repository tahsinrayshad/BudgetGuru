export type TransactionType = "INCOME" | "EXPENSE" | "LOAN";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  category: string;
  transactionDate: Date;
  budgetId: string | null;
  loanId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionResponse = Omit<Transaction, "userId">;

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  description?: string;
  category?: string;
  transactionDate: string; // ISO date string
  budgetId?: string;
  loanId?: string;
}

export interface TransactionUpdateRequest {
  type?: TransactionType;
  amount?: number;
  description?: string;
  category?: string;
  transactionDate?: string;
  budgetId?: string;
  loanId?: string;
}

export interface TransactionApiResponse {
  success: boolean;
  message: string;
  transaction?: TransactionResponse;
  transactions?: TransactionResponse[];
}
