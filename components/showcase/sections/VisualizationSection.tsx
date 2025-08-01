// components/showcase/sections/VisualizationSection.tsx
'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Calendar, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Mock data
const appointments = [
  { time: '09:00', patient: 'นายสมชาย ใจดี', doctor: 'นพ.วิทยา', type: 'ตรวจทั่วไป' },
  { time: '10:30', patient: 'นางสาวมาลี สวยงาม', doctor: 'นพ.สุดา', type: 'ตรวจครรภ์' },
  { time: '14:00', patient: 'นายวิชัย มั่นคง', doctor: 'นพ.ประยุทธ', type: 'ตรวจหัวใจ' }
]

export function VisualizationSection() {
  return (
    <motion.section id="visualization" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chart / Graph</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">จำนวนผู้ป่วยรายเดือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end space-x-2 h-32">
                    {[65, 45, 78, 92, 56, 89, 73].map((height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-blue-500 rounded-t flex-1 min-h-[20px]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>ม.ค.</span>
                    <span>ก.พ.</span>
                    <span>มี.ค.</span>
                    <span>เม.ย.</span>
                    <span>พ.ค.</span>
                    <span>มิ.ย.</span>
                    <span>ก.ค.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">กรกฎาคม 2025</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {(['อ', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as string[]).map((day: string, idx: number) => (
                      <div key={day + idx} className="p-2 font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                      <Button
                        key={date}
                        variant={date === 26 ? "default" : "ghost"}
                        size="sm"
                        className={`p-2 text-xs ${
                          date % 7 === 0 ? 'text-red-500' : ''
                        }`}
                      >
                        {date}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 text-sm font-medium text-muted-foreground">
                            {appointment.time}
                          </div>
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctor} - {appointment.type}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}