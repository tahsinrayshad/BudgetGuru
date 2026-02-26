"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Search, Filter, Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddTransactionDialog } from "@/components/dialogs/add-transaction-dialog"
import { EditTransactionDialog } from "@/components/dialogs/edit-transaction-dialog"
import { DeleteConfirmationModal } from "@/components/dialogs/delete-confirmation-modal"
import { authUtils } from "@/lib/auth-client"
import { API_CONFIG } from "@/lib/api-config"
import { toast } from "sonner"

interface ApiTransaction {
  id: string
  type: "INCOME" | "EXPENSE" | "LOAN"
  amount: number
  description: string
  category: string
  transactionDate: string
  budgetId?: string | null
  loanId?: string | null
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  description: string
  category: string
  amount: number
  type: "income" | "expense" | "loan"
  date: string
  status: "Completed" | "Pending"
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("")
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string>("")
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false)
  const [categories, setCategories] = useState<string[]>(["All"])

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = authUtils.getToken()
      if (!token) return

      const response = await fetch(`${window.location.origin}/api/categories`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok && data.categories) {
        setCategories(["All", ...data.categories])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const token = authUtils.getToken()

      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch transactions")
      }

      // Transform API data to component format
      const transformedTransactions: Transaction[] = data.transactions.map(
        (tx: ApiTransaction) => ({
          id: tx.id,
          description: tx.description,
          category: tx.category,
          amount: tx.type === "EXPENSE" || tx.type === "LOAN" ? -tx.amount : tx.amount,
          type: tx.type.toLowerCase() as "income" | "expense" | "loan",
          date: new Date(tx.transactionDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status: "Completed",
        })
      )

      setTransactions(transformedTransactions)
      setError(null)
      // Refresh categories after fetching transactions
      fetchCategories()
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionToDelete(transactionId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return

    setIsDeletingTransaction(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(`${window.location.origin}/api/transactions/${transactionToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      toast.success("Transaction deleted successfully!")
      setIsDeleteConfirmOpen(false)
      setTransactionToDelete("")
      fetchTransactions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction")
    } finally {
      setIsDeletingTransaction(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || tx.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate totals from filtered transactions
  const totalInflow = filteredTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalOutflow = Math.abs(
    filteredTransactions
      .filter((tx) => tx.type === "expense" || tx.type === "loan")
      .reduce((sum, tx) => sum + tx.amount, 0)
  )

  const netBalance = totalInflow - totalOutflow

  return (
    <div className="flex flex-col gap-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#10b981" }}>
              Total Inflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full" style={{ backgroundColor: "#10b981" }}>
                <ArrowDownLeft className="size-4" style={{ color: "#FFFFFF" }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
                ${totalInflow.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#ef4444" }}>
              Total Outflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full" style={{ backgroundColor: "#ef4444" }}>
                <ArrowUpRight className="size-4" style={{ color: "#FFFFFF" }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
                ${totalOutflow.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--stormy-teal)" }}>
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold" style={{ color: "var(--stormy-teal)" }}>
              {netBalance >= 0 ? "+" : ""}{netBalance.toFixed(2)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                Recent Transactions
              </CardTitle>
              <CardDescription>All account activity</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--stormy-teal)" }} />
                <Input 
                  placeholder="Search transactions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-64" 
                  style={{ 
                    borderColor: "var(--steel-blue)",
                    backgroundColor: "#FFFFFF",
                    outline: "none",
                    color: "var(--ink-black)"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px var(--stormy-teal)`
                    e.currentTarget.style.border = "1px solid var(--stormy-teal)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.border = "1px solid var(--steel-blue)"
                  }}
                />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-full sm:w-auto"
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  style={{ 
                    borderColor: "var(--stormy-teal)", 
                    color: "var(--charcoal-blue)",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <Filter className="size-4 mr-1.5" />
                  Filter
                </Button>
                {showCategoryFilter && (
                  <div 
                    className="absolute top-full right-0 mt-1 rounded-md shadow-lg border p-2 z-10 min-w-max"
                    style={{ borderColor: "var(--steel-blue)", backgroundColor: "#FFFFFF" }}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat)
                          setShowCategoryFilter(false)
                        }}
                        className="block w-full text-left px-3 py-1.5 text-sm rounded hover:opacity-75 transition"
                        style={{
                          color: selectedCategory === cat ? "#FFFFFF" : "var(--charcoal-blue)",
                          backgroundColor: selectedCategory === cat ? "var(--stormy-teal)" : "transparent"
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                className="h-9 w-full sm:w-auto"
                onClick={() => setIsAddDialogOpen(true)}
                style={{ 
                  backgroundColor: "var(--stormy-teal)",
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                <Plus className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-6" style={{ color: "var(--stormy-teal)" }}>
              Loading transactions...
            </div>
          ) : error ? (
            <div className="text-center py-6" style={{ color: "var(--dark-cyan)" }}>
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent" style={{ borderColor: "var(--steel-blue)" }}>
                  <TableHead style={{ color: "var(--charcoal-blue)" }} className="whitespace-nowrap">Date</TableHead>
                  <TableHead style={{ color: "var(--charcoal-blue)" }} className="whitespace-nowrap">Description</TableHead>
                  <TableHead style={{ color: "var(--charcoal-blue)" }} className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="text-right whitespace-nowrap" style={{ color: "var(--charcoal-blue)" }}>Amount</TableHead>
                  <TableHead className="text-right whitespace-nowrap" style={{ color: "var(--charcoal-blue)" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} style={{ borderColor: "var(--steel-blue)" }}>
                      <TableCell className="font-medium" style={{ color: "var(--ink-black)" }}>
                        {tx.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex size-8 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: tx.type === "income" ? "#10b981" : tx.type === "expense" ? "#ef4444" : "#f59e0b"
                            }}
                          >
                            {tx.type === "income" ? (
                              <ArrowDownLeft className="size-4" style={{ color: "#FFFFFF" }} />
                            ) : (
                              <ArrowUpRight className="size-4" style={{ color: "#FFFFFF" }} />
                            )}
                          </div>
                          <span className="font-medium" style={{ color: "var(--ink-black)" }}>
                            {tx.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className="font-normal"
                          style={{
                            backgroundColor: "var(--steel-blue)",
                            color: "var(--ink-black)",
                            border: "1px solid var(--stormy-teal)"
                          }}
                        >
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell 
                        className="text-right font-medium"
                        style={{
                          color: tx.type === "income" ? "#10b981" : tx.type === "expense" ? "#ef4444" : "#f59e0b"
                        }}
                      >
                        {tx.type === "income" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTransactionId(tx.id)
                              setIsEditDialogOpen(true)
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition"
                            title="Edit transaction"
                          >
                            <Edit className="size-4" style={{ color: "var(--stormy-teal)" }} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition"
                            title="Delete transaction"
                          >
                            <Trash2 className="size-4" style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6" style={{ color: "var(--stormy-teal)" }}>
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onTransactionAdded={fetchTransactions}
      />

      <EditTransactionDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onTransactionUpdated={fetchTransactions}
        transactionId={selectedTransactionId}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onConfirm={confirmDeleteTransaction}
        onCancel={() => {
          setIsDeleteConfirmOpen(false)
          setTransactionToDelete("")
        }}
        isLoading={isDeletingTransaction}
      />
    </div>
  )
}
