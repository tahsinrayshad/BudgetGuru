"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
  X,
  Edit,
  Trash2,
} from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authUtils } from "@/lib/auth-client"
import { API_CONFIG } from "@/lib/api-config"
import { getCurrencySymbol } from "@/lib/currency"
import { toast } from "sonner"

type LoanType = "BORROWED" | "LENT"

interface ApiLoan {
  id: string
  userId: string
  type: LoanType
  amount: number
  description?: string
  deadline: string
  isPaid: boolean
  createdAt: string
  transactions: any[]
}

interface Loan extends ApiLoan {}

export function LoansContent() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState<string>("USD")
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | LoanType>("ALL")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "UNPAID">("ALL")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: "BORROWED" as LoanType,
    amount: "",
    deadline: "",
    description: "",
  })

  useEffect(() => {
    fetchUserPreferences()
    fetchLoans()
  }, [])

  const fetchUserPreferences = async () => {
    try {
      const token = authUtils.getToken()
      if (!token) return

      const response = await fetch(
        `${window.location.origin}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCurrency(data.currency || "USD")
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error)
      setCurrency("USD")
    }
  }

  const fetchLoans = async () => {
    try {
      setIsLoading(true)
      const token = authUtils.getToken()

      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch loans")
      }

      setLoans(data.loans || [])
      setError(null)
    } catch (err) {
      console.error("Failed to fetch loans:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch loans")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const url = editingLoanId 
        ? API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS_BY_ID(editingLoanId))
        : API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS)

      const response = await fetch(url, {
        method: editingLoanId ? "PUT" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          deadline: formData.deadline,
          description: formData.description || null,
          isPaid: editingLoanId ? loans.find(l => l.id === editingLoanId)?.isPaid : false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingLoanId ? "update" : "create"} loan`)
      }

      toast.success(editingLoanId ? "Loan updated successfully" : "Loan created successfully")
      setShowAddForm(false)
      setEditingLoanId(null)
      setFormData({ type: "BORROWED", amount: "", deadline: "", description: "" })
      await fetchLoans()
    } catch (err) {
      console.error(editingLoanId ? "Failed to update loan:" : "Failed to create loan:", err)
      toast.error(err instanceof Error ? err.message : `Failed to ${editingLoanId ? "update" : "create"} loan`)
    }
  }

  const handleEditLoan = (loan: Loan) => {
    setEditingLoanId(loan.id)
    setFormData({
      type: loan.type,
      amount: loan.amount.toString(),
      deadline: loan.deadline,
      description: loan.description || "",
    })
    setShowAddForm(true)
  }

  const handleDeleteLoan = async (loanId: string) => {
    if (!confirm("Are you sure you want to delete this loan?")) return

    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS_BY_ID(loanId)),
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete loan")
      }

      toast.success("Loan deleted successfully")
      await fetchLoans()
    } catch (err) {
      console.error("Failed to delete loan:", err)
      toast.error(err instanceof Error ? err.message : "Failed to delete loan")
    }
  }

  const handleTogglePaid = async (loanId: string, currentStatus: boolean) => {
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const loan = loans.find(l => l.id === loanId)
      if (!loan) return

      const response = await fetch(
        API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.LOANS_BY_ID(loanId)),
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: loan.type,
            amount: loan.amount,
            deadline: loan.deadline,
            description: loan.description,
            isPaid: !currentStatus,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update loan status")
      }

      toast.success(!currentStatus ? "Loan marked as paid" : "Loan marked as unpaid")
      await fetchLoans()
    } catch (err) {
      console.error("Failed to update loan status:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update loan status")
    }
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingLoanId(null)
    setFormData({ type: "BORROWED", amount: "", deadline: "", description: "" })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const dl = new Date(deadline)
    const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Summaries
  const totalBorrowed = loans
    .filter((l) => l.type === "BORROWED" && !l.isPaid)
    .reduce((s, l) => s + l.amount, 0)
  const totalLent = loans
    .filter((l) => l.type === "LENT" && !l.isPaid)
    .reduce((s, l) => s + l.amount, 0)
  const overdueBorrowed = loans.filter(
    (l) => l.type === "BORROWED" && !l.isPaid && getDaysUntilDeadline(l.deadline) < 0
  ).length
  const overdueLent = loans.filter(
    (l) => l.type === "LENT" && !l.isPaid && getDaysUntilDeadline(l.deadline) < 0
  ).length
  const paidCount = loans.filter((l) => l.isPaid).length
  const activeCount = loans.filter((l) => !l.isPaid).length
  const netBalance = totalLent - totalBorrowed

  // Filtering
  const filtered = loans.filter((loan) => {
    const matchesSearch =
      !search ||
      (loan.description || "").toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "ALL" || loan.type === filterType
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PAID" && loan.isPaid) ||
      (filterStatus === "UNPAID" && !loan.isPaid)
    return matchesSearch && matchesType && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading loans..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              You Owe
            </CardTitle>
            <ArrowUpRight className="size-4" style={{ color: "#ef4444" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
              {getCurrencySymbol(currency)}{totalBorrowed.toLocaleString()}
            </div>
            {overdueBorrowed > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="size-3" style={{ color: "#ef4444" }} />
                <span className="text-xs" style={{ color: "#ef4444" }}>
                  {overdueBorrowed} overdue
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Owed to You
            </CardTitle>
            <ArrowDownLeft className="size-4" style={{ color: "var(--stormy-teal)" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
              {getCurrencySymbol(currency)}{totalLent.toLocaleString()}
            </div>
            {overdueLent > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="size-3" style={{ color: "#f59e0b" }} />
                <span className="text-xs" style={{ color: "#f59e0b" }}>
                  {overdueLent} overdue
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Active Loans
            </CardTitle>
            <Clock className="size-4" style={{ color: "#f59e0b" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
              {activeCount}
            </div>
            <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
              Pending settlement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "var(--steel-blue)" }}>
              Settled
            </CardTitle>
            <CheckCircle2 className="size-4" style={{ color: "#10b981" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "var(--stormy-teal)" }}>
              {paidCount}
            </div>
            <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
              Fully paid off
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Balance Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6 gap-1">
          <p className="text-sm" style={{ color: "var(--stormy-teal)" }}>
            Net Loan Balance
          </p>
          <div
            className="text-3xl font-bold"
            style={{ color: netBalance >= 0 ? "var(--stormy-teal)" : "#ef4444" }}
          >
            {netBalance >= 0 ? "+" : ""}
            {getCurrencySymbol(currency)}{Math.abs(netBalance).toLocaleString()}
          </div>
          <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
            {netBalance >= 0
              ? "Others owe you more than you owe"
              : "You owe more than others owe you"}
          </p>
        </CardContent>
      </Card>

      {/* Filters + Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--stormy-teal)" }} />
            <Input
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-64"
              style={{ borderColor: "var(--steel-blue)", backgroundColor: "#FFFFFF", color: "var(--charcoal-blue)" }}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center rounded-lg border" style={{ borderColor: "var(--steel-blue)" }}>
            {(["ALL", "BORROWED", "LENT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filterType === t ? "var(--stormy-teal)" : "transparent",
                  color: filterType === t ? "#FFFFFF" : "var(--stormy-teal)",
                }}
              >
                {t === "ALL" ? "All Types" : t === "BORROWED" ? "Borrowed" : "Lent"}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-lg border" style={{ borderColor: "var(--steel-blue)" }}>
            {(["ALL", "UNPAID", "PAID"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filterStatus === s ? "var(--stormy-teal)" : "transparent",
                  color: filterStatus === s ? "#FFFFFF" : "var(--stormy-teal)",
                }}
              >
                {s === "ALL" ? "All Status" : s === "PAID" ? "Paid" : "Unpaid"}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => handleCloseForm()}
          style={{
            backgroundColor: "var(--stormy-teal)",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          {showAddForm ? (
            <>
              <X className="size-4 mr-1.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4 mr-1.5" />
              Add Loan
            </>
          )}
        </Button>
      </div>

      {/* Add/Edit Loan Form */}
      {showAddForm && (
        <Card style={{ borderColor: "var(--stormy-teal)", borderWidth: "2px" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
              {editingLoanId ? "Edit Loan" : "New Loan"}
            </CardTitle>
            <CardDescription>{editingLoanId ? "Update loan details" : "Record a new borrowed or lent amount"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleAddLoan}>
              {/* Type Selection */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm" style={{ color: "var(--steel-blue)" }}>
                  Loan Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="group cursor-pointer">
                    <input
                      type="radio"
                      name="loanType"
                      value="BORROWED"
                      checked={formData.type === "BORROWED"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as LoanType })}
                      className="peer sr-only"
                    />
                    <div
                      className="flex items-center gap-3 rounded-lg border p-4 transition-colors"
                      style={{
                        borderColor:
                          formData.type === "BORROWED" ? "#ef4444" : "var(--steel-blue)",
                        backgroundColor:
                          formData.type === "BORROWED" ? "#ef44441a" : "transparent",
                      }}
                    >
                      <div
                        className="flex size-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#ef44441a" }}
                      >
                        <ArrowUpRight className="size-5" style={{ color: "#ef4444" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                          Borrowed
                        </p>
                        <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                          You owe someone
                        </p>
                      </div>
                    </div>
                  </label>
                  <label className="group cursor-pointer">
                    <input
                      type="radio"
                      name="loanType"
                      value="LENT"
                      checked={formData.type === "LENT"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as LoanType })}
                      className="peer sr-only"
                    />
                    <div
                      className="flex items-center gap-3 rounded-lg border p-4 transition-colors"
                      style={{
                        borderColor:
                          formData.type === "LENT" ? "var(--stormy-teal)" : "var(--steel-blue)",
                        backgroundColor:
                          formData.type === "LENT" ? "#1abc9c1a" : "transparent",
                      }}
                    >
                      <div
                        className="flex size-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#1abc9c1a" }}
                      >
                        <ArrowDownLeft className="size-5" style={{ color: "var(--stormy-teal)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                          Lent
                        </p>
                        <p className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                          Someone owes you
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Amount + Deadline */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="loan-amount" className="text-sm" style={{ color: "var(--steel-blue)" }}>
                    Amount
                  </Label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--stormy-teal)" }} />
                    <Input
                      id="loan-amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-10"
                      style={{ borderColor: "var(--steel-blue)", backgroundColor: "#FFFFFF" }}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="loan-deadline" className="text-sm" style={{ color: "var(--steel-blue)" }}>
                    Deadline
                  </Label>
                  <Calendar 
                    value={formData.deadline}
                    onChange={(date) => setFormData({ ...formData, deadline: date })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="loan-desc" className="text-sm" style={{ color: "var(--steel-blue)" }}>
                  Description (optional)
                </Label>
                <Textarea
                  id="loan-desc"
                  placeholder="e.g. Borrowed from Ali for house renovation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="resize-none"
                  style={{ borderColor: "var(--steel-blue)" }}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseForm()}
                  style={{ borderColor: "var(--steel-blue)", color: "var(--stormy-teal)", backgroundColor: "#FFFFFF" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  style={{
                    backgroundColor: "var(--stormy-teal)",
                    color: "#FFFFFF",
                    border: "none",
                  }}
                >
                  {editingLoanId ? "Update Loan" : "Add Loan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base" style={{ color: "var(--charcoal-blue)" }}>
                All Loans
              </CardTitle>
              <CardDescription>
                Showing {filtered.length} of {loans.length} loans
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: "var(--stormy-teal)" }}>
              <CircleDollarSign className="size-10 mb-3 opacity-40" />
              <p className="text-sm">No loans match your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead style={{ color: "var(--steel-blue)" }}>Type</TableHead>
                  <TableHead style={{ color: "var(--steel-blue)" }}>Description</TableHead>
                  <TableHead style={{ color: "var(--steel-blue)" }}>Amount</TableHead>
                  <TableHead style={{ color: "var(--steel-blue)" }}>Deadline</TableHead>
                  <TableHead style={{ color: "var(--steel-blue)" }}>Status</TableHead>
                  <TableHead className="text-right" style={{ color: "var(--steel-blue)" }}>
                    Created
                  </TableHead>
                  <TableHead className="text-right" style={{ color: "var(--steel-blue)" }}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((loan) => {
                  const daysLeft = getDaysUntilDeadline(loan.deadline)
                  const isOverdue = !loan.isPaid && daysLeft < 0
                  const isUrgent = !loan.isPaid && daysLeft >= 0 && daysLeft <= 7

                  return (
                    <TableRow key={loan.id}>
                      {/* Type */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex size-8 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                loan.type === "BORROWED" ? "#ef44441a" : "#1abc9c1a",
                            }}
                          >
                            {loan.type === "BORROWED" ? (
                              <ArrowUpRight className="size-4" style={{ color: "#ef4444" }} />
                            ) : (
                              <ArrowDownLeft className="size-4" style={{ color: "var(--stormy-teal)" }} />
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor:
                                loan.type === "BORROWED" ? "#ef44441a" : "#1abc9c1a",
                              color: loan.type === "BORROWED" ? "#ef4444" : "var(--stormy-teal)",
                              border: "none",
                            }}
                          >
                            {loan.type === "BORROWED" ? "Borrowed" : "Lent"}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <span className="font-medium" style={{ color: "var(--charcoal-blue)" }}>
                          {loan.description || "No description"}
                        </span>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span
                          className="font-semibold"
                          style={{
                            color: loan.type === "BORROWED" ? "#ef4444" : "var(--stormy-teal)",
                          }}
                        >
                          {loan.type === "BORROWED" ? "-" : "+"}
                          {getCurrencySymbol(currency)}{loan.amount.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm" style={{ color: "var(--charcoal-blue)" }}>
                            {formatDate(loan.deadline)}
                          </span>
                          {loan.isPaid ? (
                            <span className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                              Settled
                            </span>
                          ) : isOverdue ? (
                            <span className="text-xs font-medium" style={{ color: "#ef4444" }}>
                              {Math.abs(daysLeft)} days overdue
                            </span>
                          ) : isUrgent ? (
                            <span className="text-xs font-medium" style={{ color: "#f59e0b" }}>
                              {daysLeft} days left
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--stormy-teal)" }}>
                              {daysLeft} days left
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {loan.isPaid ? (
                          <Badge
                            variant="default"
                            style={{
                              backgroundColor: "#10b98115",
                              color: "#10b981",
                              border: "none",
                            }}
                          >
                            <CheckCircle2 className="size-3 mr-1" />
                            Paid
                          </Badge>
                        ) : isOverdue ? (
                          <Badge
                            variant="default"
                            style={{
                              backgroundColor: "#ef444415",
                              color: "#ef4444",
                              border: "none",
                            }}
                          >
                            <AlertTriangle className="size-3 mr-1" />
                            Overdue
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: "#f59e0b",
                              color: "#f59e0b",
                            }}
                          >
                            <Clock className="size-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-right" style={{ color: "var(--stormy-teal)" }}>
                        {formatDate(loan.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleTogglePaid(loan.id, loan.isPaid)}
                            className="p-2 rounded-md hover:opacity-75 transition"
                            style={{ color: loan.isPaid ? "#10b981" : "var(--stormy-teal)" }}
                            title={loan.isPaid ? "Mark as unpaid" : "Mark as paid"}
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleEditLoan(loan)}
                            className="p-2 rounded-md hover:opacity-75 transition"
                            style={{ color: "var(--stormy-teal)" }}
                            title="Edit loan"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLoan(loan.id)}
                            className="p-2 rounded-md hover:opacity-75 transition"
                            style={{ color: "#ef4444" }}
                            title="Delete loan"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
