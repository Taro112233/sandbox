// components/ui/skeleton.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  animation?: "pulse" | "wave" | "none"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "rectangular",
      width,
      height,
      animation = "pulse",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: "rounded-lg",
      circular: "rounded-full",
      rectangular: "rounded-xl",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-default-200 relative overflow-hidden",
          variantClasses[variant],
          animation === "pulse" && "animate-pulse",
          animation === "wave" && "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          className
        )}
        style={{
          width: width || "100%",
          height: height || (variant === "text" ? "1em" : "20px"),
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Composite skeleton components
export const SkeletonText = ({ lines = 3, ...props }: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "80%" : "100%"}
        />
      ))}
    </div>
  )
}

export const SkeletonAvatar = ({ size = 40, ...props }: { size?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      {...props}
    />
  )
}

export const SkeletonCard = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="space-y-4 p-4 border-2 border-default-200 rounded-xl" {...props}>
      <div className="flex items-center space-x-4">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={200} />
      <SkeletonText lines={2} />
    </div>
  )
}

export { Skeleton }