// components/ui/collapsible.tsx
"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.Root>, React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>>(
  ({ ...props }, ref) => (
    <CollapsiblePrimitive.Root
      ref={ref}
      data-slot="collapsible"
      {...props}
    />
  )
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>, React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>>(
  ({ ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleTrigger
      ref={ref}
      data-slot="collapsible-trigger"
      {...props}
    />
  )
)
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>, React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>>(
  ({ ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      data-slot="collapsible-content"
      className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all"
      {...props}
    />
  )
)
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }