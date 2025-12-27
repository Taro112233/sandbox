// components/ui/badge.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border-2 px-3 py-1 text-xs font-semibold transition-colors shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow-primary/20",
        secondary:
          "border-transparent bg-default-200 text-default-900 dark:bg-default-800 dark:text-default-100",
        destructive:
          "border-transparent bg-danger text-white shadow-danger/20",
        outline: "border-default-300 bg-transparent text-default-900",
        success:
          "border-transparent bg-green-500 text-white shadow-green-500/20",
        warning:
          "border-transparent bg-yellow-500 text-white shadow-yellow-500/20",
        error:
          "border-transparent bg-red-500 text-white shadow-red-500/20",
        info:
          "border-transparent bg-blue-500 text-white shadow-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }