"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  HandCoins,
  LogOut,
  ChevronUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authUtils } from "@/lib/auth-client"

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Transactions", icon: ArrowLeftRight, id: "transactions" },
  { title: "Budgets", icon: Wallet, id: "budgets" },
  { title: "Loans", icon: HandCoins, id: "loans" },
]

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userName?: string
  userEmail?: string
  userInitials?: string
}

export function AppSidebar({
  activeTab,
  onTabChange,
  userName: propUserName,
  userEmail: propUserEmail,
  userInitials: propUserInitials,
}: AppSidebarProps) {
  const router = useRouter()
  const { isOpen } = useSidebar()
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userInitials, setUserInitials] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Debug: Check if token exists
        const token = authUtils.getToken()
        
        const result = await authUtils.getCurrentUser()
        
        if (result.success && result.user) {
          setUserName(result.user.name)
          setUserEmail(result.user.email)
          
          // Generate initials from name
          const displayName = result.user.name || result.user.email || ""
          const initials = displayName
            .split(" ")
            .map((word: string) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          setUserInitials(initials || "")
        } else {
          console.warn("Failed to fetch user:", result.message)
          // Redirect to login if no token
          if (result.message === "No token found") {
            router.push("/")
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className={cn("flex items-center w-full", isOpen ? "justify-between" : "justify-center")}>
          {isOpen && (
            <Image src="/BudgetGurux_logo.png" alt="BudgetGuru" width={160} height={160} />
          )}
          <SidebarTrigger className="h-8 w-8 p-1 flex-shrink-0" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!isOpen ? "hidden" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    tooltip={item.title}
                    className={
                      activeTab === item.id
                        ? "bg-primary/10 hover:bg-primary/15"
                        : ""
                    }
                  >
                    <item.icon
                      className={cn(
                        "size-4",
                        activeTab === item.id && "text-primary"
                      )}
                    />
                    <span className={!isOpen ? "hidden" : ""}>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            {userName && userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="Profile">
                    <Avatar className="size-7">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=${userName}`}
                        alt="User avatar"
                      />
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--almond-cream)",
                          color: "var(--stormy-teal)",
                        }}
                        className="text-xs font-semibold"
                      >
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col", !isOpen && "hidden")}>
                      <span className="text-sm font-medium text-white">
                        {userName}
                      </span>
                      <span className="text-xs text-gray-100">
                        {userEmail}
                      </span>
                    </div>
                    <ChevronUp className={cn("ml-auto size-4 text-gray-100", !isOpen && "hidden")} />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="top" 
                  align="start" 
                  className="w-56 bg-amber-50"
                  style={{
                    borderColor: "#fffbeb",
                  }}
                >
                  <DropdownMenuItem className="text-gray-700 hover:bg-opacity-75">Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 hover:bg-opacity-75">Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator style={{ backgroundColor: "#f3e8d8" }} />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-gray-700 hover:bg-opacity-75 cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton disabled className="cursor-not-allowed opacity-50">
                <span className="text-sm text-gray-500">Loading...</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

