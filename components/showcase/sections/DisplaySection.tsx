// components/sections/DisplaySection.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Eye, Users, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Mock data
const patients = [
  { id: '001', name: 'นายสมชาย ใจดี', age: 45, department: 'Internal Medicine', status: 'active' },
  { id: '002', name: 'นางสาวมาลี สวยงาม', age: 28, department: 'Pediatrics', status: 'waiting' },
  { id: '003', name: 'นายวิชัย มั่นคง', age: 62, department: 'Cardiology', status: 'completed' }
]

export function DisplaySection() {
  const [showModal, setShowModal] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [progress] = useState(65)

  return (
    <motion.section id="display" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mr-3">
              <Eye className="w-5 h-5 text-white" />
            </div>
            Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hoverable">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">ผู้ป่วยวันนี้</p>
                        <p className="text-2xl font-bold">124</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hoverable">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">นัดหมายวันนี้</p>
                        <p className="text-2xl font-bold">48</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Table</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient, index) => (
                      <TableRow key={patient.id} animated delay={index}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.department}</TableCell>
                        <TableCell>
                          <Badge variant={
                            patient.status === 'active' ? 'success' :
                            patient.status === 'waiting' ? 'warning' : 'default'
                          }>
                            {patient.status === 'active' ? 'กำลังรักษา' :
                             patient.status === 'waiting' ? 'รอคิว' : 'เสร็จสิ้น'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Badges & Progress */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Badges & Progress</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">ปกติ</Badge>
                  <Badge variant="warning">เฝ้าระวัง</Badge>
                  <Badge variant="error">ฉุกเฉิน</Badge>
                  <Badge variant="success">หายแล้ว</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ความคืบหน้าการรักษา</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} showLabel={false} />
                </div>
              </div>
            </div>

            {/* Modal & Popover */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Modal & Popover</h3>
              <div className="space-y-3">
                <Dialog open={showModal} onOpenChange={setShowModal}>
                  <DialogTrigger asChild>
                    <Button>เปิด Modal</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ข้อมูลผู้ป่วย</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">ชื่อ-นามสกุล</Label>
                        <p className="text-sm">นายสมชาย ใจดี</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">อายุ</Label>
                        <p className="text-sm">45 ปี</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">แผนก</Label>
                        <p className="text-sm">อายุรกรรม</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowModal(false)}>
                        ปิด
                      </Button>
                      <Button>บันทึก</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Popover open={showPopover} onOpenChange={setShowPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="secondary">แสดง Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div>
                      <h4 className="font-medium mb-2">ข้อมูลเพิ่มเติม</h4>
                      <p className="text-sm text-muted-foreground">
                        นี่คือตัวอย่าง Popover ที่แสดงข้อมูลเพิ่มเติม
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}