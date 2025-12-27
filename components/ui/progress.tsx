// components/ui/progress.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  variant?: "default" | "success" | "warning" | "error"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getVariantColor = () => {
      switch (variant) {
        case "success":
          return "bg-green-500"
        case "warning":
          return "bg-yellow-500"
        case "error":
          return "bg-red-500"
        default:
          return "bg-primary"
      }
    }

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-default-600 font-medium">Progress</span>
            <span className="text-default-900 font-semibold">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "relative h-2.5 w-full overflow-hidden rounded-full bg-default-200 dark:bg-default-800",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              getVariantColor()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }