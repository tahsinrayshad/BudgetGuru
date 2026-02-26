import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { spinner: "w-6 h-6", text: "text-sm" },
    md: { spinner: "w-10 h-10", text: "text-base" },
    lg: { spinner: "w-16 h-16", text: "text-lg" },
  }

  const config = sizeMap[size]

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${config.spinner} rounded-full border-4 border-transparent animate-spin`}
        style={{
          borderColor: "var(--steel-blue)",
          borderTopColor: "var(--stormy-teal)",
          animation: "spin 1s linear infinite",
        }}
      />
      {text && (
        <p className={`${config.text} font-medium`} style={{ color: "var(--charcoal-blue)" }}>
          {text}
        </p>
      )}
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

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    )
  }

  return content
}
