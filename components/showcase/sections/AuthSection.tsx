// components/showcase/sections/AuthSection.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { User, Eye, EyeOff, Mail, Phone, MapPin, Users, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function AuthSection() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast('เข้าสู่ระบบสำเร็จ!')
    }, 2000)
  }

  return (
    <motion.section id="auth" variants={itemVariants} className="mb-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Login Form</h3>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="username">ชื่อผู้ใช้</Label>
                      <Input
                        id="username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                        placeholder="กรอกชื่อผู้ใช้"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">รหัสผ่าน</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          placeholder="กรอกรหัสผ่าน"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">จดจำการเข้าสู่ระบบ</Label>
                      </div>
                      <Button variant="link" className="text-sm p-0">
                        ลืมรหัสผ่าน?
                      </Button>
                    </div>
                    <Button type="submit" disabled={loading} loading={loading} className="w-full">
                      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* User Avatar & Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Avatar & Profile</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar size="lg">
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Dr
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">นพ.สมชาย วิชาการ</h4>
                      <p className="text-sm text-muted-foreground">แพทย์อายุรกรรม</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-green-600">ออนไลน์</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>somchai.doctor@hospital.com</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>081-234-5678</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>แผนกอายุรกรรม ชั้น 3</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex space-x-2">
                    <Button className="flex-1" size="sm">
                      แก้ไขโปรไฟล์
                    </Button>
                    <Button variant="outline" size="sm">
                      ออกจากระบบ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Additional User Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">ผู้ป่วยวันนี้</p>
                        <p className="text-xl font-bold">24</p>
                      </div>
                      <Users className="w-6 h-6 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">นัดหมาย</p>
                        <p className="text-xl font-bold">8</p>
                      </div>
                      <Calendar className="w-6 h-6 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}