// components/ui/spinner.tsx
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("h-4 w-4 animate-spin text-primary", className)}
      {...props}
    />
  )
}

export { Spinner }