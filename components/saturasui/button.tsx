import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-purple-200 bg-white hover:bg-purple-50/50 text-purple-700 hover:border-purple-300",
        secondary:
          "bg-purple-50 text-purple-700 hover:bg-purple-100",
        ghost: "hover:bg-purple-50/50 text-purple-700 hover:text-purple-900",
        link: "text-purple-600 underline-offset-2 hover:underline hover:text-purple-700",
      },
      size: {
        default: "h-8 px-3 py-1.5 text-xs",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-9 px-4 text-xs",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

