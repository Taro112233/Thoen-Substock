// components/ui/textarea.tsx
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends Omit<HTMLMotionProps<"textarea">, "size"> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <motion.textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }