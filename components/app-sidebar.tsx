"use client"

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
  userName = "Jordan Davis",
  userEmail = "jordan@example.com",
  userInitials = "JD",
}: AppSidebarProps) {
  const router = useRouter()

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
        <div className="flex items-center gap-3">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--mauve-bark)" }}
          >
            <Wallet className="size-4 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-white tracking-tight">
              BudgetGuru
            </span>
            <span className="text-xs text-gray-100">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                    <span>{item.title}</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="Profile">
                  <Avatar className="size-7">
                    <AvatarImage
                      src="https://api.dicebear.com/9.x/notionists/svg?seed=Jordan"
                      alt="User avatar"
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor: "var(--almond-cream)",
                        color: "var(--mauve-bark)",
                      }}
                      className="text-xs font-semibold"
                    >
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-white">
                      {userName}
                    </span>
                    <span className="text-xs text-gray-100">
                      {userEmail}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 text-gray-100 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

