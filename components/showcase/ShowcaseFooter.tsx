// components/ShowcaseFooter.tsx
'use client'

import { motion } from 'motion/react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ShowcaseFooter() {
  return (
    <motion.footer variants={itemVariants} className="text-center py-8">
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-2">
            Hospital Information System - Component Showcase
          </h3>
          <p className="text-muted-foreground mb-4">
            ระบบบริหารจัดการโรงพยาบาลที่ทันสมัย ใช้งานง่าย และปลอดภัย
          </p>
          <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
            <span>© 2025 HIS Development Team</span>
            <span>•</span>
            <span>Built with Next.js, React & TailwindCSS</span>
            <span>•</span>
            <span>Enhanced with Shadcn UI & Framer Motion</span>
          </div>
          
          {/* Tech Stack Badges */}
          <div className="flex justify-center space-x-2 mt-6">
            {([
              { name: 'Next.js', variant: 'default' },
              { name: 'React', variant: 'secondary' },
              { name: 'Tailwind', variant: 'outline' },
              { name: 'Shadcn UI', variant: 'default' },
              { name: 'Framer Motion', variant: 'secondary' }
            ] as { name: string; variant: 'outline' | 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'error' | 'info' }[]).map((tech) => (
              <Badge key={tech.name} variant={tech.variant}>
                {tech.name}
              </Badge>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">50+</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">6</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">100%</div>
              <div className="text-sm text-muted-foreground">Responsive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">Modern</div>
              <div className="text-sm text-muted-foreground">Design</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.footer>
  )
}