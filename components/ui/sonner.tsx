// components/ui/sonner.tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import * as React from "react"

const iconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-default-50 group-[.toaster]:text-default-900 group-[.toaster]:border-2 group-[.toaster]:border-default-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-default-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-default-100 group-[.toast]:text-default-900 group-[.toast]:rounded-lg",
        },
      }}
      icons={{
        success: iconMap.success,
        error: iconMap.error,
        warning: iconMap.warning,
        info: iconMap.info,
      }}
      {...props}
    />
  )
}

export { Toaster }