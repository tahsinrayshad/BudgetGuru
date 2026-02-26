"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  AtSign,
  Phone,
  MapPin,
  Camera,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  Globe,
  Calendar,
  Download,
  Trash2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface UserProfile {
  id: string
  email: string
  username: string
  name: string | null
  currency: string
  dateFormat: string
  notificationsEnabled: boolean
  createdAt: Date
}

function SectionNav({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  const sections = [
    { id: "general", label: "General" },
    { id: "security", label: "Security" },
    { id: "preferences", label: "Preferences" },
  ]

  return (
    <nav className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "#f3f4f6" }}>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onChange(section.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            active === section.id ? "shadow-sm" : ""
          }`}
          style={{
            backgroundColor: active === section.id ? "#FFFFFF" : "transparent",
            color: active === section.id ? "var(--charcoal-blue)" : "#666",
            borderColor: active === section.id ? "var(--steel-blue)" : "transparent",
          }}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}

function GeneralSection({ profile, onUpdate }: { profile: UserProfile; onUpdate: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.name || "",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formData.name }),
        }
      )

      if (!response.ok) throw new Error("Failed to update profile")

      toast.success("Profile updated successfully!")
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar Section */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          Profile Photo
        </h3>
        <p className="text-sm mb-4" style={{ color: "#666" }}>
          This will be displayed on your profile.
        </p>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="size-20 border-2" style={{ borderColor: "var(--steel-blue)" }}>
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${profile.username}`}
                alt="Profile photo"
              />
              <AvatarFallback
                style={{
                  backgroundColor: "var(--dark-teal)",
                  color: "#FFFFFF",
                }}
                className="text-lg font-semibold"
              >
                {(profile.name || profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              aria-label="Change profile photo"
            >
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                style={{
                  borderColor: "var(--steel-blue)",
                  color: "var(--charcoal-blue)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Upload New
              </Button>
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          Personal Information
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Update your personal details.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName" style={{ color: "var(--charcoal-blue)" }}>
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "#666" }} />
              <Input
                id="fullName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label style={{ color: "var(--charcoal-blue)" }}>Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "#666" }} />
              <Input
                value={profile.username}
                disabled
                className="pl-10 opacity-50"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" style={{ color: "var(--charcoal-blue)" }}>
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "#666" }} />
              <Input
                id="email"
                value={profile.email}
                type="email"
                disabled
                className="pl-10 opacity-50"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label style={{ color: "var(--charcoal-blue)" }}>Member Since</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "#666" }} />
              <Input
                value={new Date(profile.createdAt).toLocaleDateString()}
                disabled
                className="pl-10 opacity-50"
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              backgroundColor: "var(--stormy-teal)",
              color: "#FFFFFF",
            }}
          >
            <Save className="size-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("All fields are required")
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwords.current,
            newPassword: passwords.new,
            confirmPassword: passwords.confirm,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to change password")
      }

      toast.success("Password changed successfully!")
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change Password */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="flex items-center gap-2 text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          <KeyRound className="size-4" style={{ color: "var(--stormy-teal)" }} />
          Change Password
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Update your password to keep your account secure.
        </p>
        <div className="flex flex-col gap-5 max-w-md">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword" style={{ color: "var(--charcoal-blue)" }}>
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                style={{ backgroundColor: "#FFFFFF" }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--stormy-teal)" }}
              >
                {showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword" style={{ color: "var(--charcoal-blue)" }}>
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                style={{ backgroundColor: "#FFFFFF" }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--stormy-teal)" }}
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmNewPassword" style={{ color: "var(--charcoal-blue)" }}>
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                style={{ backgroundColor: "#FFFFFF" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--stormy-teal)" }}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              style={{
                backgroundColor: "var(--stormy-teal)",
                color: "#FFFFFF",
              }}
            >
              <Shield className="size-4 mr-2" />
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          Active Sessions
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Manage devices where you are currently logged in.
        </p>
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between rounded-lg border p-4"
            style={{ borderColor: "var(--steel-blue)" }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
                  Current Device
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: "rgba(29, 185, 192, 0.15)",
                    color: "var(--stormy-teal)",
                  }}
                >
                  Active now
                </span>
              </div>
              <span className="text-xs" style={{ color: "#666" }}>
                Browser Session
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PreferencesSection({ profile, onUpdate }: { profile: UserProfile; onUpdate: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [prefs, setPrefs] = useState({
    currency: profile.currency,
    dateFormat: profile.dateFormat,
    notificationsEnabled: profile.notificationsEnabled,
  })

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prefs),
        }
      )

      if (!response.ok) throw new Error("Failed to update preferences")

      toast.success("Preferences updated successfully!")
      onUpdate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update preferences"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Regional Settings */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="flex items-center gap-2 text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          <Globe className="size-4" style={{ color: "var(--stormy-teal)" }} />
          Regional Settings
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Configure your regional preferences.
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label style={{ color: "var(--charcoal-blue)" }}>Currency</Label>
            <Select value={prefs.currency} onValueChange={(value) => setPrefs({ ...prefs, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="BDT">BDT (৳)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label style={{ color: "var(--charcoal-blue)" }}>Date Format</Label>
            <Select value={prefs.dateFormat} onValueChange={(value) => setPrefs({ ...prefs, dateFormat: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSavePreferences}
            disabled={isLoading}
            style={{
              backgroundColor: "var(--stormy-teal)",
              color: "#FFFFFF",
            }}
          >
            <Save className="size-4 mr-2" />
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card
        className="p-6"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="flex items-center gap-2 text-base font-semibold mb-2" style={{ color: "var(--charcoal-blue)" }}>
          <Bell className="size-4" style={{ color: "var(--stormy-teal)" }} />
          Email Notifications
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Choose which notifications you want to receive.
        </p>
        <div className="flex items-center justify-between p-3 rounded-md"
          style={{
            backgroundColor: "rgba(29, 185, 192, 0.1)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
              Email Notifications
            </span>
            <span className="text-xs" style={{ color: "#666" }}>
              Receive alerts for transactions and budgets.
            </span>
          </div>
          <Switch
            checked={prefs.notificationsEnabled}
            onCheckedChange={async (checked) => {
              const updated = { ...prefs, notificationsEnabled: checked }
              setPrefs(updated)
              
              // Auto-save preference
              try {
                const token = authUtils.getToken()
                if (!token) throw new Error("No token found")

                const response = await fetch(
                  `${window.location.origin}/api/auth/profile`,
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updated),
                  }
                )

                if (!response.ok) throw new Error("Failed to update preferences")
                toast.success("Notification preference updated!")
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Failed to update preferences"
                )
                setPrefs(prefs) // Revert on error
              }
            }}
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        className="p-6"
        style={{
          borderColor: "#ef4444",
          backgroundColor: "#FFFFFF",
        }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: "#ef4444" }}>
          Danger Zone
        </h3>
        <p className="text-sm mb-6" style={{ color: "#666" }}>
          Irreversible actions. Please proceed with caution.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium" style={{ color: "var(--charcoal-blue)" }}>
              Delete Account
            </span>
            <span className="text-xs" style={{ color: "#666" }}>
              Permanently delete your account and all data.
            </span>
          </div>
          <Button
            style={{
              backgroundColor: "transparent",
              borderColor: "#ef4444",
              color: "#ef4444",
              border: "1px solid",
            }}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("general")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authUtils.getToken()
      if (!token) {
        router.push("/")
        return
      }

      await fetchProfile()
    }

    checkAuth()
  }, [router])

  const fetchProfile = async () => {
    try {
      const token = authUtils.getToken()
      if (!token) throw new Error("No token found")

      const response = await fetch(
        `${window.location.origin}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4"
            style={{
              borderColor: "var(--steel-blue)",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "var(--charcoal-blue)" }}>Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "var(--charcoal-blue)" }}>
          Failed to load profile
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 sm:p-8 border-b"
        style={{ borderColor: "var(--steel-blue)" }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border-2" style={{ borderColor: "var(--steel-blue)" }}>
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${profile.username}`}
              alt="Profile photo"
            />
            <AvatarFallback
              style={{
                backgroundColor: "var(--dark-teal)",
                color: "#FFFFFF",
              }}
              className="text-lg font-semibold"
            >
              {(profile.name || profile.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold" style={{ color: "var(--charcoal-blue)" }}>
              {profile.name || profile.username}
            </h2>
            <p className="text-sm" style={{ color: "var(--stormy-teal)" }}>
              {profile.email}
            </p>
          </div>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: "rgba(29, 185, 192, 0.15)",
            color: "var(--stormy-teal)",
            width: "fit-content",
          }}
        >
          Active Account
        </span>
      </div>

      {/* Settings Content */}
      <div className="p-6 sm:p-8">
        <div className="space-y-6 max-w-4xl">
          {/* Section Navigation */}
          <SectionNav active={activeSection} onChange={setActiveSection} />

          {/* Section Content */}
          {activeSection === "general" && (
            <GeneralSection profile={profile} onUpdate={fetchProfile} />
          )}
          {activeSection === "security" && (
            <SecuritySection />
          )}
          {activeSection === "preferences" && (
            <PreferencesSection profile={profile} onUpdate={fetchProfile} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
