// components/showcase/sections/LayoutSection.tsx - แก้ไข nested button issue
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Home, Users, Calendar, FileText, Settings, Menu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function LayoutSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [accordionValue, setAccordionValue] = useState('')

  const sidebarItems = [
    { icon: Home, label: 'หน้าหลัก', id: 'home' },
    { icon: Users, label: 'ผู้ป่วย', id: 'patients' },
    { icon: Calendar, label: 'นัดหมาย', id: 'appointments' },
    { icon: FileText, label: 'รายงาน', id: 'reports' },
    { icon: Settings, label: 'ตั้งค่า', id: 'settings' }
  ]

  return (
    <motion.section id="layout" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <Menu className="w-5 h-5 text-white" />
            </div>
            Layout & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sidebar</h3>
              <div className="flex">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button>แสดง Sidebar</Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>HIS Dashboard</SheetTitle>
                      <SheetDescription>
                        ระบบบริหารจัดการโรงพยาบาล
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="mt-4 space-y-2">
                      {sidebarItems.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            console.log(`Navigate to ${item.label}`)
                            setSidebarOpen(false)
                          }}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tabs</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                  <TabsTrigger value="patients">ผู้ป่วย</TabsTrigger>
                  <TabsTrigger value="reports">รายงาน</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p>ข้อมูลภาพรวมของระบบ</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="patients" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p>รายการผู้ป่วยทั้งหมด</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p>รายงานสถิติต่าง ๆ</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Accordion */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-lg font-semibold">Accordion</h3>
              <Accordion type="single" value={accordionValue} onValueChange={setAccordionValue} collapsible>
                <AccordionItem value="info">
                  <AccordionTrigger>ข้อมูลส่วนตัว</AccordionTrigger>
                  <AccordionContent>
                    ชื่อ, เลขบัตรประชาชน, ที่อยู่
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="medical">
                  <AccordionTrigger>ประวัติการรักษา</AccordionTrigger>
                  <AccordionContent>
                    การรักษาครั้งที่ผ่านมา
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="insurance">
                  <AccordionTrigger>ข้อมูลการประกัน</AccordionTrigger>
                  <AccordionContent>
                    ประกันสังคม, ประกันสุขภาพ
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}