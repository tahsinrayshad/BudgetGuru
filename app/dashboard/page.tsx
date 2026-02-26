"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { TransactionsContent } from "@/components/transactions-content"
import { SidebarProvider } from "@/components/ui/sidebar"
import { authUtils } from "@/lib/auth-client"

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authUtils.getToken()
        
        if (!token) {
          router.replace("/")
          return
        }

        // Verify token is still valid by fetching current user
        const result = await authUtils.getCurrentUser()
        
        if (!result.success || !result.user) {
          authUtils.removeToken()
          router.replace("/")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.replace("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Don't render anything until we've verified authentication
  if (isLoading) {
    return null
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full" style={{ backgroundColor: "#FFFFFF" }}>
        {/* Sidebar */}
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          userName="Jordan Davis"
          userEmail="jordan@example.com"
          userInitials="JD"
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "transactions" && "Transactions"}
                {activeTab === "budgets" && "Budgets"}
                {activeTab === "loans" && "Loans"}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === "dashboard" && "Welcome back! Here's your financial overview."}
                {activeTab === "transactions" && "Manage and track all your transactions."}
                {activeTab === "budgets" && "Set and monitor your spending budgets."}
                {activeTab === "loans" && "Track and manage your loans."}
              </p>
            </div>

            {/* Content based on active tab */}
            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "transactions" && <TransactionsContent />}
          {activeTab === "budgets" && (
            <div className="bg-amber-50 rounded-lg p-8 text-center text-gray-600">
              Budgets content coming soon...
            </div>
          )}
          {activeTab === "loans" && (
            <div className="bg-amber-50 rounded-lg p-8 text-center text-gray-600">
              Loans content coming soon...
            </div>
          )}
        </div>
      </div>
      </div>
    </SidebarProvider>
  )
}
