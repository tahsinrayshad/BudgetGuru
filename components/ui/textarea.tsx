import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ""}`}
      style={{
        borderColor: "var(--steel-blue)",
        backgroundColor: "#FFFFFF",
        color: "var(--charcoal-blue)",
      }}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
