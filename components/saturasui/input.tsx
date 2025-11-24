import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded border border-purple-200/80 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:border-purple-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

