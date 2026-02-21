export enum LoanType {
    BORROWED = "BORROWED",
    LENT = "LENT",
}

export interface Loan {
    id: string;
    userId: string;
    type: LoanType;
    amount: number;
    description: string | null;
    deadline: Date;
    isPaid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type LoanResponse = Omit<Loan, "userId">;

export interface LoanRequest {
    type: LoanType;
    amount: number;
    description?: string;
    deadline: string;
    isPaid?: boolean;
}

export interface LoanUpdateRequest {
    type?: LoanType;
    amount?: number;
    description?: string;
    deadline?: string;
    isPaid?: boolean;
}

export interface LoanApiResponse {
    success: boolean;
    message: string;
    loan?: LoanResponse;
    loans?: LoanResponse[];
}