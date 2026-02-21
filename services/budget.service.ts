import { prisma } from "@/lib/prisma-client";
import {
  Budget,
  BudgetRequest,
  BudgetUpdateRequest,
  BudgetResponse,
} from "@/types/budget";

// Helper function to validate budget data
function validateBudgetData(data: BudgetRequest | BudgetUpdateRequest): string | null {
  if ("title" in data && !data.title?.trim()) {
    return "Title is required";
  }

  if ("amount" in data && data.amount !== undefined) {
    if (data.amount <= 0) {
      return "Amount must be greater than 0";
    }
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start >= end) {
      return "Start date must be before end date";
    }
  }

  return null;
}

// Helper function to format budget response (exclude userId)
function formatBudgetResponse(budget: any): Omit<Budget, "userId"> {
  const { userId, ...budgetWithoutUserId } = budget;
  return budgetWithoutUserId;
}

export async function createBudget(
  userId: string,
  data: BudgetRequest
): Promise<{ success: boolean; budget?: BudgetResponse; message: string }> {
  try {
    // Validate input
    const validationError = validateBudgetData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Create budget
    const budget = await prisma.budget.create({
        data: {
            userId,
            title: data.title,
            amount: data.amount,
            description: data.description || null,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        },
    });

    return {
      success: true,
      message: "Budget created successfully",
      budget: formatBudgetResponse(budget),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create budget",
    };
  }
}

export async function updateBudget(
  budgetId: string,
  userId: string,
  data: BudgetUpdateRequest
): Promise<{ success: boolean; budget?: BudgetResponse; message: string }> {
  try {
    // Verify ownership
    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return { success: false, message: "Budget not found" };
    }

    if (existingBudget.userId !== userId) {
      return { success: false, message: "Unauthorized to update this budget" };
    }

    // Validate input
    const validationError = validateBudgetData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Prepare update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
    });

    return {
      success: true,
      message: "Budget updated successfully",
      budget: formatBudgetResponse(updatedBudget),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update budget",
    };
  }
}

export async function deleteBudget(
  budgetId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify ownership
    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return { success: false, message: "Budget not found" };
    }

    if (existingBudget.userId !== userId) {
      return { success: false, message: "Unauthorized to delete this budget" };
    }

    // Delete budget
    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return {
      success: true,
      message: "Budget deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete budget",
    };
  }
}

export async function getBudgetById(
  budgetId: string,
  userId: string
): Promise<{ success: boolean; budget?: BudgetResponse; message: string }> {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      return { success: false, message: "Budget not found" };
    }

    if (budget.userId !== userId) {
      return { success: false, message: "Unauthorized to access this budget" };
    }

    return {
      success: true,
      message: "Budget fetched successfully",
      budget: formatBudgetResponse(budget),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch budget",
    };
  }
}

export async function getAllBudgetsByUser(
  userId: string
): Promise<{ success: boolean; budgets?: BudgetResponse[]; message: string }> {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Budgets fetched successfully",
      budgets: budgets.map(formatBudgetResponse),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch budgets",
    };
  }
}
