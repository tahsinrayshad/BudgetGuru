/**
 * API Configuration
 * 
 * This file centralizes all API URLs.
 * Use process.env.NEXT_PUBLIC_API_URL to set the API base URL.
 * 
 * Environment Setup:
 * - Local Development: .env.local (NEXT_PUBLIC_API_URL=http://localhost:3000)
 * - Production: Set NEXT_PUBLIC_API_URL in your deployment platform (Vercel, etc.)
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  
  ENDPOINTS: {
    // Auth endpoints
    AUTH_LOGIN: "/api/auth/login",
    AUTH_REGISTER: "/api/auth/register",
    AUTH_LOGOUT: "/api/auth/logout",
    AUTH_ME: "/api/auth/me",
    
    // Transactions endpoints
    TRANSACTIONS: "/api/transactions",
    TRANSACTIONS_BY_ID: (id: string) => `/api/transactions/${id}`,
    TRANSACTIONS_BUDGET: (id: string) => `/api/transactions/budget/${id}`,
    TRANSACTIONS_LOAN: (id: string) => `/api/transactions/loan/${id}`,
    
    // Budgets endpoints
    BUDGETS: "/api/budgets",
    BUDGETS_BY_ID: (id: string) => `/api/budgets/${id}`,
    
    // Loans endpoints
    LOANS: "/api/loans",
    LOANS_BY_ID: (id: string) => `/api/loans/${id}`,
    
    // Analytics endpoints
    ANALYTICS_BUDGETS: "/api/analytics/budgets",
    ANALYTICS_TRANSACTIONS_CATEGORIES: "/api/analytics/transactions/categories",
    ANALYTICS_TRANSACTIONS_DISTRIBUTION: "/api/analytics/transactions/distribution",
    ANALYTICS_TRANSACTIONS_INCOME_EXPENSE: "/api/analytics/transactions/income-expense",
    ANALYTICS_TRANSACTIONS_TIME_BASED: "/api/analytics/transactions/time-based",
  },
  
  // Helper method to get full URL
  getFullUrl: (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  },
}
