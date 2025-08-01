// components/ui/switch.tsx
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<HTMLMotionProps<"button">, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <motion.span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-colors"
          )}
          animate={{
            x: checked ? 20 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }