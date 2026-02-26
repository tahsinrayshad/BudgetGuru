"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BudgetsContent } from "@/components/budget-content"
import { authUtils } from "@/lib/auth-client"

export default function BudgetsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authUtils.getToken()
      if (!token) {
        router.replace("/")
        return
      }

      try {
        const user = await authUtils.getCurrentUser()
        if (user) {
          setIsAuthorized(true)
        } else {
          router.replace("/")
        }
      } catch {
        router.replace("/")
      }
    }

    checkAuth()
  }, [router])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
          Budgets
        </h1>
        <p className="mt-2" style={{ color: "var(--stormy-teal)" }}>
          Manage and track your budget across different categories
        </p>
      </div>
      <BudgetsContent />
    </div>
  )
}
