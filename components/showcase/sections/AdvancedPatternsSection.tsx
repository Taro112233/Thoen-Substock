// components/sections/AdvancedPatternsSection.tsx
'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  StatefulUIPatternDemo, 
  RoleBasedUIDemo, 
  FormValidationDemo, 
  AccessibilityDemo, 
  DataFetchingDemo 
} from '../DemoComponents'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function AdvancedPatternsSection() {
  return (
    <>
      {/* Advanced Patterns Section */}
      <motion.section variants={itemVariants} className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Advanced UI Patterns</CardTitle>
            <CardDescription>
              ตัวอย่าง Pattern ขั้นสูงสำหรับ HIS Application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stateful UI Pattern */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stateful UI Pattern</h3>
                <StatefulUIPatternDemo />
              </div>

              {/* Role-based UI */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Role-based UI</h3>
                <RoleBasedUIDemo />
              </div>

              {/* Form Validation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Form Validation</h3>
                <FormValidationDemo />
              </div>

              {/* Accessibility Demo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Accessibility</h3>
                <AccessibilityDemo />
              </div>

              {/* Data Fetching Pattern */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-lg font-semibold">Data Fetching Pattern</h3>
                <DataFetchingDemo />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Skeleton Components Section */}
      <motion.section variants={itemVariants} className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Skeleton & Loading States</CardTitle>
            <CardDescription>
              ตัวอย่าง Loading States และ Skeleton Components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Text Skeleton */}
              <div className="space-y-2">
                <h4 className="font-medium">Text Skeleton</h4>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              {/* Avatar Skeleton */}
              <div className="space-y-2">
                <h4 className="font-medium">Avatar Skeleton</h4>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>

              {/* Card Skeleton */}
              <div className="space-y-2">
                <h4 className="font-medium">Card Skeleton</h4>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </>
  )
}