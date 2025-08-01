// components/showcase/FloatingActionButton.tsx
'use client'

import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function FloatingActionButton() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        size="icon"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-xl transition-shadow"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronRight className="w-6 h-6 -rotate-90" />
      </Button>
    </motion.div>
  )
}