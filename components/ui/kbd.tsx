// components/ui/kbd.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-default-100 text-default-700 border-2 border-default-200",
        "pointer-events-none inline-flex h-6 w-fit min-w-6 items-center justify-center gap-1.5",
        "rounded-lg px-2 font-sans text-xs font-semibold select-none shadow-sm",
        "[&_svg:not([class*='size-'])]:size-3.5",
        "[[data-slot=tooltip-content]_&]:bg-default-900/10 [[data-slot=tooltip-content]_&]:text-default-50 [[data-slot=tooltip-content]_&]:border-default-700/20",
        "dark:bg-default-800 dark:text-default-300 dark:border-default-700",
        className
      )}
      {...props}
    />
  )
}
Kbd.displayName = "Kbd"

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}
KbdGroup.displayName = "KbdGroup"

export { Kbd, KbdGroup }