// components/ui/avatar.tsx
"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

export interface AvatarProps extends Omit<HTMLMotionProps<"div">, "children"> {
  size?: "sm" | "md" | "lg" | "xl"
  status?: "online" | "offline" | "away" | "busy"
  children?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", status, children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    }

    const statusSizes = {
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-4 w-4",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-default-200",
          sizeClasses[size],
          className
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
        {status && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
              statusSizes[size],
              status === "online" && "bg-green-500",
              status === "offline" && "bg-default-400",
              status === "away" && "bg-yellow-500",
              status === "busy" && "bg-red-500"
            )}
          />
        )}
      </motion.div>
    )
  }
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends Omit<React.ComponentPropsWithRef<typeof Image>, "alt"> {
  alt?: string
}

const AvatarImage = React.forwardRef<React.ElementRef<typeof Image>, AvatarImageProps>(
  ({ className, alt = "", src, ...props }, ref) => (
    <Image
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      alt={alt}
      src={src || ""}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-default-100 text-default-600 font-medium",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }