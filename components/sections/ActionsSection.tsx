// components/sections/ActionsSection.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Activity, Plus, Check, Edit, Trash2, Info, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ActionsSection() {
  const [loading, setLoading] = useState(false)

  return (
    <motion.section id="actions" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Action & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>เพิ่ม</span>
                </Button>
                <Button variant="success" className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>บันทึก</span>
                </Button>
                <Button variant="warning" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>แก้ไข</span>
                </Button>
                <Button variant="danger" className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>ลบ</span>
                </Button>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Alerts</h3>
              <div className="space-y-3">
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle>ข้อมูลทั่วไป</AlertTitle>
                  <AlertDescription>ระบบทำงานปกติ</AlertDescription>
                </Alert>
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>สำเร็จ</AlertTitle>
                  <AlertDescription>บันทึกข้อมูลเรียบร้อย</AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>คำเตือน</AlertTitle>
                  <AlertDescription>ตรวจสอบข้อมูลอีกครั้ง</AlertDescription>
                </Alert>
                <Alert variant="error">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>ข้อผิดพลาด</AlertTitle>
                  <AlertDescription>ไม่สามารถเชื่อมต่อได้</AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Loading & Spinner */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loading & Spinner</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 2000);
                  }}
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? 'กำลังโหลด...' : 'เริ่มโหลด'}
                </Button>
                <div className="flex items-center space-x-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Toast */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Toast</h3>
              <Button
                variant="success"
                onClick={() => toast('บันทึกข้อมูลสำเร็จ!')}
              >
                แสดง Toast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}