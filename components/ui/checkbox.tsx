// components/ui/checkbox.tsx
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<HTMLMotionProps<"button">, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  error?: boolean
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, error, ...props }, ref) => {
    return (
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-background",
          error ? "border-red-500" : "border-input",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        {...props}
      >
        <motion.div
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center justify-center"
        >
          <Check className="h-3 w-3" />
        </motion.div>
      </motion.button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }