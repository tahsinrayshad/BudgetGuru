"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  value?: string
  onChange: (date: string) => void
  minDate?: string
  maxDate?: string
}

export function Calendar({ value, onChange, minDate, maxDate }: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  )
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    )
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    setSelectedDate(newDate)
    const dateString = newDate.toISOString().split("T")[0]
    onChange(dateString)
    setIsOpen(false)
  }

  const isDateDisabled = (date: Date): boolean => {
    const dateString = date.toISOString().split("T")[0]
    if (minDate && dateString < minDate) return true
    if (maxDate && dateString > maxDate) return true
    return false
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = Array(firstDayOfMonth).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Select date"

  return (
    <div className="relative w-full" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-md border text-left flex items-center justify-between transition-all hover:border-opacity-80"
        style={{
          borderColor: "var(--steel-blue)",
          backgroundColor: "#FFFFFF",
          color: "var(--charcoal-blue)",
        }}
      >
        <span className="text-sm">{displayValue}</span>
        <svg
          className="w-4 h-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 p-4 rounded-lg border shadow-2xl z-50 animate-in fade-in zoom-in duration-200"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "var(--steel-blue)",
          }}
        >
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition"
              style={{ color: "var(--stormy-teal)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--charcoal-blue)" }}
            >
              {monthName}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition"
              style={{ color: "var(--stormy-teal)" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium py-2"
                style={{ color: "var(--stormy-teal)" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-8" />
              }

              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isSelected =
                selectedDate &&
                cellDate.toDateString() === selectedDate.toDateString()
              const isDisabled = isDateDisabled(cellDate)
              const isToday = cellDate.toDateString() === new Date().toDateString()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleDateClick(day)}
                  disabled={isDisabled}
                  className={`h-8 w-full rounded text-sm font-medium transition-all ${
                    isSelected
                      ? "text-white shadow-md"
                      : isToday
                      ? "border-2"
                      : "hover:bg-gray-100"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--stormy-teal)",
                        }
                      : isToday
                      ? {
                          borderColor: "var(--dark-teal)",
                          color: "var(--charcoal-blue)",
                        }
                      : {
                          color: "var(--charcoal-blue)",
                        }
                  }
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--steel-blue)" }}>
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                handleDateClick(today.getDate())
              }}
              className="px-2 py-1 text-xs rounded hover:bg-gray-100 transition"
              style={{ color: "var(--stormy-teal)" }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                setCurrentMonth(tomorrow)
                handleDateClick(tomorrow.getDate())
              }}
              className="px-2 py-1 text-xs rounded hover:bg-gray-100 transition"
              style={{ color: "var(--stormy-teal)" }}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-xs rounded hover:bg-gray-100 transition"
              style={{ color: "var(--charcoal-blue)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
