import { prisma } from "@/lib/prisma-client";
import { 
    Loan, 
    LoanRequest, 
    LoanUpdateRequest, 
    LoanResponse 
} from "@/types/loan";

// Helper function to validate loan data
function validateLoanData(data: LoanRequest | LoanUpdateRequest): string | null {
  if ("type" in data && data.type !== undefined && !["BORROWED", "LENT"].includes(data.type)) {
    return "Type must be either BORROWED or LENT";
  }

  if ("amount" in data && data.amount !== undefined) {
    if (data.amount <= 0) {
      return "Amount must be greater than 0";
    }
  }

  if ("deadline" in data && data.deadline) {
    const deadline = new Date(data.deadline);
    if (deadline <= new Date()) {
      return "Deadline must be in the future";
    }
  }

  return null;
}

// Helper function to format loan response (exclude userId)
function formatLoanResponse(loan: any): Omit<Loan, "userId"> {
  const { userId, ...loanWithoutUserId } = loan;
  return loanWithoutUserId;
}

export async function createLoan(
  userId: string,
  data: LoanRequest
): Promise<{ success: boolean; loan?: LoanResponse; message: string }> {
  try {
    // Validate input
    const validationError = validateLoanData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        deadline: new Date(data.deadline),
        isPaid: data.isPaid || false,
      },
    });

    return {
      success: true,
      message: "Loan created successfully",
      loan: formatLoanResponse(loan),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create loan",
    };
  }
}

export async function updateLoan(
  loanId: string,
  userId: string,
  data: LoanUpdateRequest
): Promise<{ success: boolean; loan?: LoanResponse; message: string }> {
  try {
    // Verify ownership
    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!existingLoan) {
      return { success: false, message: "Loan not found" };
    }

    if (existingLoan.userId !== userId) {
      return { success: false, message: "Unauthorized to update this loan" };
    }

    // Validate input
    const validationError = validateLoanData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Prepare update data
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.deadline !== undefined) updateData.deadline = new Date(data.deadline);
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;

    // Update loan
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: updateData,
    });

    return {
      success: true,
      message: "Loan updated successfully",
      loan: formatLoanResponse(updatedLoan),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update loan",
    };
  }
}

export async function deleteLoan(
  loanId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify ownership
    const existingLoan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!existingLoan) {
      return { success: false, message: "Loan not found" };
    }

    if (existingLoan.userId !== userId) {
      return { success: false, message: "Unauthorized to delete this loan" };
    }

    // Delete loan
    await prisma.loan.delete({
      where: { id: loanId },
    });

    return {
      success: true,
      message: "Loan deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete loan",
    };
  }
}

export async function getLoanById(
  loanId: string,
  userId: string
): Promise<{ success: boolean; loan?: LoanResponse; message: string }> {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return { success: false, message: "Loan not found" };
    }

    if (loan.userId !== userId) {
      return { success: false, message: "Unauthorized to access this loan" };
    }

    return {
      success: true,
      message: "Loan fetched successfully",
      loan: formatLoanResponse(loan),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch loan",
    };
  }
}

export async function getAllLoansByUser(
  userId: string
): Promise<{ success: boolean; loans?: LoanResponse[]; message: string }> {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Loans fetched successfully",
      loans: loans.map(formatLoanResponse),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch loans",
    };
  }
}
