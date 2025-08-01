// components/ui/input.tsx
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

export interface InputProps extends Omit<HTMLMotionProps<"input">, "size"> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-input focus-visible:ring-blue-500",
          className
        )}
        ref={ref}
        animate={error ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={
          error
            ? { type: "tween", duration: 0.4 }
            : { type: "spring", duration: 0.4 }
        }
        onFocus={() => {}}
        onBlur={() => {}}
        whileFocus={{ scale: 1.02 }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }