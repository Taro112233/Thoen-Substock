// app/showcase/page.tsx
'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Activity, Menu, Edit, Eye, Calendar, User } from 'lucide-react'

// Import sections
import { BackgroundDecoration } from '@/components/showcase/BackgroundDecoration'
import { FloatingActionButton } from '@/components/showcase/FloatingActionButton'
import { ShowcaseFooter } from '@/components/showcase/ShowcaseFooter'
import { ShowcaseHeader } from '@/components/showcase/ShowcaseHeader'
import { ShowcaseNavigation } from '@/components/showcase/ShowcaseNavigation'
import { ActionsSection } from '@/components/showcase/sections/ActionsSection'
import { AdvancedPatternsSection } from '@/components/showcase/sections/AdvancedPatternsSection'
import { AuthSection } from '@/components/showcase/sections/AuthSection'
import { DisplaySection } from '@/components/showcase/sections/DisplaySection'
import { FormsSection } from '@/components/showcase/sections/FormsSection'
import { LayoutSection } from '@/components/showcase/sections/LayoutSection'
import { VisualizationSection } from '@/components/showcase/sections/VisualizationSection'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Component showcase sections data
export const showcaseSections = [
  {
    id: 'layout',
    title: '1. Layout & Navigation',
    icon: <Menu className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'forms',
    title: '2. Input & Form',
    icon: <Edit className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'display',
    title: '3. Display',
    icon: <Eye className="w-5 h-5" />,
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'actions',
    title: '4. Action & Feedback',
    icon: <Activity className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'visualization',
    title: '5. Visualization',
    icon: <Calendar className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'auth',
    title: '6. Authentication',
    icon: <User className="w-5 h-5" />,
    color: 'from-indigo-500 to-blue-500'
  }
]

export default function ShowcasePage() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div suppressHydrationWarning />
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <ShowcaseHeader />

      {/* Main Content */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Page Title */}
        <motion.section variants={itemVariants} className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Hospital Information System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Component Showcase สำหรับระบบบริหารจัดการโรงพยาบาล
            <br />
            ออกแบบด้วย Next.js, React, TailwindCSS, Shadcn UI และ Framer Motion
          </p>
        </motion.section>

        {/* Navigation Menu */}
        <ShowcaseNavigation sections={showcaseSections} />

        {/* All Sections */}
        <LayoutSection />
        <FormsSection />
        <DisplaySection />
        <ActionsSection />
        <VisualizationSection />
        <AuthSection />
        <AdvancedPatternsSection />

        {/* Footer */}
        <ShowcaseFooter />
      </motion.main>
      
      {/* Floating Components */}
      <FloatingActionButton />
      <BackgroundDecoration />
    </div>
  )
}