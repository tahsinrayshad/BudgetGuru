"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { authUtils } from "@/lib/auth-client"
import { toast } from "sonner"

interface PreferencesSectionProps {
  currency: string
  dateFormat: string
  notificationsEnabled: boolean
  onPreferencesUpdated: () => void
}

export function PreferencesSection({
  currency,
  dateFormat,
  notificationsEnabled,
  onPreferencesUpdated,
}: PreferencesSectionProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [selectedDateFormat, setSelectedDateFormat] =
    useState(dateFormat)
  const [notificationsOn, setNotificationsOn] = useState(
    notificationsEnabled
  )
  const [isLoading, setIsLoading] = useState(false)

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "JPY", symbol: "¥" },
    { code: "AUD", symbol: "A$" },
    { code: "CAD", symbol: "C$" },
  ]

  const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
  ]

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
          body: JSON.stringify({
            currency: selectedCurrency,
            dateFormat: selectedDateFormat,
            notificationsEnabled: notificationsOn,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences")
      }

      toast.success("Preferences updated successfully!")
      onPreferencesUpdated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update preferences"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className="p-6"
      style={{
        borderColor: "var(--steel-blue)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: "var(--charcoal-blue)" }}
      >
        Preferences
      </h3>

      {/* Currency */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: "var(--charcoal-blue)" }}
        >
          Currency
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelectedCurrency(curr.code)}
              className="p-2 rounded-md border-2 text-sm font-medium transition"
              style={{
                borderColor:
                  selectedCurrency === curr.code
                    ? "var(--stormy-teal)"
                    : "var(--steel-blue)",
                backgroundColor:
                  selectedCurrency === curr.code
                    ? "var(--dark-teal)"
                    : "#FFFFFF",
                color:
                  selectedCurrency === curr.code
                    ? "#FFFFFF"
                    : "var(--charcoal-blue)",
              }}
            >
              {curr.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Date Format */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: "var(--charcoal-blue)" }}
        >
          Date Format
        </label>
        <div className="space-y-2">
          {dateFormats.map((format) => (
            <button
              key={format}
              onClick={() => setSelectedDateFormat(format)}
              className="w-full p-3 rounded-md border text-left text-sm transition"
              style={{
                borderColor:
                  selectedDateFormat === format
                    ? "var(--stormy-teal)"
                    : "var(--steel-blue)",
                backgroundColor:
                  selectedDateFormat === format
                    ? "var(--dark-teal)"
                    : "#FFFFFF",
                color:
                  selectedDateFormat === format
                    ? "#FFFFFF"
                    : "var(--charcoal-blue)",
              }}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-6 flex items-center justify-between p-3 rounded-md"
        style={{
          backgroundColor: "rgba(29, 185, 192, 0.1)",
        }}
      >
        <label
          className="text-sm font-medium"
          style={{ color: "var(--charcoal-blue)" }}
        >
          Email Notifications
        </label>
        <button
          type="button"
          onClick={() => setNotificationsOn(!notificationsOn)}
          className={`w-12 h-6 rounded-full transition relative ${
            notificationsOn ? "bg-green-500" : "bg-gray-300"
          }`}
          style={{
            backgroundColor: notificationsOn
              ? "var(--stormy-teal)"
              : "#d1d5db",
          }}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition ${
              notificationsOn ? "right-0.5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSavePreferences}
        disabled={isLoading}
        className="w-full"
        style={{
          backgroundColor: "var(--stormy-teal)",
          color: "#FFFFFF",
          border: "none",
        }}
      >
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </Card>
  )
}
