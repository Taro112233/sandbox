// components/ui/radio-group.tsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  orientation?: "horizontal" | "vertical"
}

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={cn(
          "grid gap-3",
          orientation === "horizontal" ? "grid-flow-col" : "grid-flow-row",
          className
        )}
        {...props}
        ref={ref}
      />
    )
  }
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentProps<typeof RadioGroupPrimitive.Item>>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "aspect-square h-5 w-5 rounded-full border-2 border-primary shadow-sm",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-primary/80 hover:shadow-md",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-in zoom-in-50 duration-200" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
  }
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }