// components/ui/label.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  error?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, error, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-semibold leading-relaxed text-default-900",
          "transition-colors duration-200",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          error && "text-danger",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-danger ml-1 font-bold" aria-label="required">
            *
          </span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label }