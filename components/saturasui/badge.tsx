import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        rose: "border-transparent bg-[#BF3A5D] text-white hover:bg-[#BF3A5D]/80",
        forest: "border-transparent bg-[#28401C] text-white hover:bg-[#28401C]/80",
        gold: "border-transparent bg-[#F1BB1B] text-white hover:bg-[#F1BB1B]/80",
        cream: "border-transparent bg-[#F1E9D0] text-gray-900 hover:bg-[#F1E9D0]/80",
        orange: "border-transparent bg-[#D87827] text-white hover:bg-[#D87827]/80",
        teal: "border-transparent bg-[#11B9A6] text-white hover:bg-[#11B9A6]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

