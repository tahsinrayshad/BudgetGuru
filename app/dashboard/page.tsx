"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { TransactionsContent } from "@/components/transactions-content"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

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
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ color: "var(--charcoal-blue)" }}>
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
