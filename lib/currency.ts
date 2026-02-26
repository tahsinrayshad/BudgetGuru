/**
 * Currency symbol mapping
 */
export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  BDT: "৳",
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = "USD"): string {
  return currencySymbols[currencyCode] || "$"
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${Math.abs(amount).toFixed(2)}`
}

/**
 * Format amount with sign and currency symbol (for transactions)
 */
export function formatCurrencyWithSign(
  amount: number,
  currencyCode: string = "USD",
  type?: "income" | "expense" | "loan"
): string {
  const symbol = getCurrencySymbol(currencyCode)
  const sign = amount >= 0 ? "+" : ""
  return `${sign}${symbol}${Math.abs(amount).toFixed(2)}`
}
