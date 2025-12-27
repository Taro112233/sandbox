// components/ui/alert.tsx
"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border-l-4 p-5 shadow-sm [&>svg~*]:pl-8 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-5 [&>svg]:h-5 [&>svg]:w-5",
  {
    variants: {
      variant: {
        default: "bg-default-50 border-default-300 text-default-900",
        info: "border-blue-500 bg-blue-50 text-blue-900 [&>svg]:text-blue-500 dark:bg-blue-950/50 dark:text-blue-200",
        success: "border-green-500 bg-green-50 text-green-900 [&>svg]:text-green-500 dark:bg-green-950/50 dark:text-green-200",
        warning: "border-yellow-500 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-500 dark:bg-yellow-950/50 dark:text-yellow-200",
        destructive: "border-red-500 bg-red-50 text-red-900 [&>svg]:text-red-500 dark:bg-red-950/50 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  destructive: XCircle,
} as const

export interface AlertProps extends Omit<HTMLMotionProps<"div">, "children">, VariantProps<typeof alertVariants> {
  showIcon?: boolean
  children?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", showIcon = true, children, ...props }, ref) => {
    const Icon = iconMap[variant || "default"]

    return (
      <motion.div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        {...props}
      >
        {showIcon && <Icon className="h-5 w-5" />}
        {children}
      </motion.div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-2 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }