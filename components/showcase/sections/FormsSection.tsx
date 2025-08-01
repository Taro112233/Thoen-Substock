// components/showcase/sections/FormsSection.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Edit, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function FormsSection() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [checkboxes, setCheckboxes] = useState({ option1: false, option2: true })
  const [radio, setRadio] = useState('option1')
  const [switchOn, setSwitchOn] = useState(false)

  return (
    <motion.section id="forms" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <Edit className="w-5 h-5 text-white" />
            </div>
            Input & Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input & Textarea */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Input & Textarea</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="patient-name">ชื่อผู้ป่วย</Label>
                  <Input
                    id="patient-name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="กรอกชื่อผู้ป่วย"
                  />
                </div>
                <div>
                  <Label htmlFor="symptoms">อาการ</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="อธิบายอาการ..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Select & Search */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="department">แผนก</Label>
                  <select
                    id="department"
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">เลือกแผนก</option>
                    <option value="internal">อายุรกรรม</option>
                    <option value="surgery">ศัลยกรรม</option>
                    <option value="pediatrics">กุมารเวชศาสตร์</option>
                    <option value="cardiology">โรคหัวใจ</option>
                  </select>
                </div>
                <div className="relative">
                  <Input placeholder="ค้นหาแพทย์..." className="pr-10" />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Checkbox & Radio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Checkbox & Radio</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allergy"
                      checked={checkboxes.option1}
                      onCheckedChange={(checked) => 
                        setCheckboxes({...checkboxes, option1: checked as boolean})
                      }
                    />
                    <Label htmlFor="allergy">แพ้ยา</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="chronic"
                      checked={checkboxes.option2}
                      onCheckedChange={(checked) => 
                        setCheckboxes({...checkboxes, option2: checked as boolean})
                      }
                    />
                    <Label htmlFor="chronic">โรคประจำตัว</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">เพศ</Label>
                  <RadioGroup value={radio} onValueChange={setRadio}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">ชาย</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">หญิง</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Switch */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Switch</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    รับการแจ้งเตือน
                  </Label>
                  <Switch
                    id="notifications"
                    checked={switchOn}
                    onCheckedChange={setSwitchOn}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}