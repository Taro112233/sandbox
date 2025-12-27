// components/ui/command.tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-default-50 text-default-900",
        className
      )}
      {...props}
    />
  )
)
Command.displayName = "Command"

// ✅ FIX: ไม่ใช้ forwardRef กับ CommandDialog
interface CommandDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title?: string
  description?: string
  showCloseButton?: boolean
  className?: string
}

function CommandDialog({ 
  title = "Command Palette", 
  description = "Search for a command to run...", 
  children, 
  className, 
  showCloseButton = true, 
  ...props 
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-default-500 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
CommandDialog.displayName = "CommandDialog"

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="command-input-wrapper"
      className="flex h-12 items-center gap-3 border-b-2 border-default-200 px-4"
    >
      <SearchIcon className="h-5 w-5 shrink-0 text-default-400" />
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-default-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
)
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn(
        "max-h-[400px] scroll-py-2 overflow-x-hidden overflow-y-auto p-2",
        className
      )}
      {...props}
    />
  )
)
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>(
  ({ ...props }, ref) => (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      className="py-8 text-center text-sm text-default-500"
      {...props}
    />
  )
)
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        "overflow-hidden text-default-900",
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-default-500",
        className
      )}
      {...props}
    />
  )
)
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn("bg-default-200 -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
)
CommandSeparator.displayName = "CommandSeparator"

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-hidden select-none",
        "transition-colors duration-150",
        "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='text-'])]:text-default-500",
        className
      )}
      {...props}
    />
  )
)
CommandItem.displayName = "CommandItem"

const CommandShortcut = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-wide text-default-400 font-medium",
        className
      )}
      {...props}
    />
  )
)
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}