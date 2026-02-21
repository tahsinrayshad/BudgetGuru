import { prisma } from "@/lib/prisma-client";
import {
  Transaction,
  TransactionRequest,
  TransactionUpdateRequest,
  TransactionResponse,
} from "@/types/transaction";

// Helper function to validate transaction data
function validateTransactionData(
  data: TransactionRequest | TransactionUpdateRequest
): string | null {
  if ("type" in data && data.type !== undefined && !["INCOME", "EXPENSE", "LOAN"].includes(data.type)) {
    return "Type must be INCOME, EXPENSE, or LOAN";
  }

  if ("amount" in data && data.amount !== undefined) {
    if (data.amount <= 0) {
      return "Amount must be greater than 0";
    }
  }

  return null;
}

// Helper function to format transaction response (exclude userId)
function formatTransactionResponse(transaction: any): Omit<Transaction, "userId"> {
  const { userId, ...transactionWithoutUserId } = transaction;
  return transactionWithoutUserId;
}

// Helper function to verify budget ownership
async function verifyBudgetOwnership(budgetId: string, userId: string): Promise<boolean> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
  });
  return budget?.userId === userId;
}

// Helper function to verify loan ownership
async function verifyLoanOwnership(loanId: string, userId: string): Promise<boolean> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });
  return loan?.userId === userId;
}

export async function createTransaction(
  userId: string,
  data: TransactionRequest
): Promise<{ success: boolean; transaction?: TransactionResponse; message: string }> {
  try {
    // Validate input
    const validationError = validateTransactionData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Verify budget ownership if provided
    if (data.budgetId) {
      const budgetOwned = await verifyBudgetOwnership(data.budgetId, userId);
      if (!budgetOwned) {
        return { success: false, message: "Budget not found or unauthorized" };
      }
    }

    // Verify loan ownership if provided
    if (data.loanId) {
      const loanOwned = await verifyLoanOwnership(data.loanId, userId);
      if (!loanOwned) {
        return { success: false, message: "Loan not found or unauthorized" };
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        category: data.category || "General",
        transactionDate: new Date(data.transactionDate),
        budgetId: data.budgetId || null,
        loanId: data.loanId || null,
      },
    });

    return {
      success: true,
      message: "Transaction created successfully",
      transaction: formatTransactionResponse(transaction),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}

export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: TransactionUpdateRequest
): Promise<{ success: boolean; transaction?: TransactionResponse; message: string }> {
  try {
    // Verify ownership
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return { success: false, message: "Transaction not found" };
    }

    if (existingTransaction.userId !== userId) {
      return { success: false, message: "Unauthorized to update this transaction" };
    }

    // Validate input
    const validationError = validateTransactionData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Verify budget ownership if provided
    if (data.budgetId) {
      const budgetOwned = await verifyBudgetOwnership(data.budgetId, userId);
      if (!budgetOwned) {
        return { success: false, message: "Budget not found or unauthorized" };
      }
    }

    // Verify loan ownership if provided
    if (data.loanId) {
      const loanOwned = await verifyLoanOwnership(data.loanId, userId);
      if (!loanOwned) {
        return { success: false, message: "Loan not found or unauthorized" };
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.transactionDate !== undefined) updateData.transactionDate = new Date(data.transactionDate);
    if (data.budgetId !== undefined) updateData.budgetId = data.budgetId;
    if (data.loanId !== undefined) updateData.loanId = data.loanId;

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    return {
      success: true,
      message: "Transaction updated successfully",
      transaction: formatTransactionResponse(updatedTransaction),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update transaction",
    };
  }
}

export async function deleteTransaction(
  transactionId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify ownership
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return { success: false, message: "Transaction not found" };
    }

    if (existingTransaction.userId !== userId) {
      return { success: false, message: "Unauthorized to delete this transaction" };
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return {
      success: true,
      message: "Transaction deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete transaction",
    };
  }
}

export async function getTransactionById(
  transactionId: string,
  userId: string
): Promise<{ success: boolean; transaction?: TransactionResponse; message: string }> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { success: false, message: "Transaction not found" };
    }

    if (transaction.userId !== userId) {
      return { success: false, message: "Unauthorized to access this transaction" };
    }

    return {
      success: true,
      message: "Transaction fetched successfully",
      transaction: formatTransactionResponse(transaction),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch transaction",
    };
  }
}

export async function getAllTransactionsByUser(
  userId: string
): Promise<{ success: boolean; transactions?: TransactionResponse[]; message: string }> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: "desc" },
    });

    return {
      success: true,
      message: "Transactions fetched successfully",
      transactions: transactions.map(formatTransactionResponse),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

export async function getTransactionsByBudget(
  budgetId: string,
  userId: string
): Promise<{ success: boolean; transactions?: TransactionResponse[]; message: string }> {
  try {
    // Verify budget ownership
    const budgetOwned = await verifyBudgetOwnership(budgetId, userId);
    if (!budgetOwned) {
      return { success: false, message: "Budget not found or unauthorized" };
    }

    const transactions = await prisma.transaction.findMany({
      where: { budgetId, userId },
      orderBy: { transactionDate: "desc" },
    });

    return {
      success: true,
      message: "Budget transactions fetched successfully",
      transactions: transactions.map(formatTransactionResponse),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}

export async function getTransactionsByLoan(
  loanId: string,
  userId: string
): Promise<{ success: boolean; transactions?: TransactionResponse[]; message: string }> {
  try {
    // Verify loan ownership
    const loanOwned = await verifyLoanOwnership(loanId, userId);
    if (!loanOwned) {
      return { success: false, message: "Loan not found or unauthorized" };
    }

    const transactions = await prisma.transaction.findMany({
      where: { loanId, userId },
      orderBy: { transactionDate: "desc" },
    });

    return {
      success: true,
      message: "Loan transactions fetched successfully",
      transactions: transactions.map(formatTransactionResponse),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}
