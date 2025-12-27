// components/ui/toggle.tsx
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold whitespace-nowrap outline-none transition-all duration-200 hover:bg-default-100 hover:text-default-900 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-primary/20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 aria-invalid:ring-danger/20 aria-invalid:border-danger",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-2 border-default-200 bg-transparent shadow-sm hover:bg-default-100 hover:text-default-900 data-[state=on]:border-primary",
      },
      size: {
        default: "h-11 px-4 min-w-11",
        sm: "h-9 px-3 min-w-9",
        lg: "h-12 px-5 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }