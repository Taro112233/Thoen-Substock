// app/page.tsx
// Updated homepage - Landing page with link to calculator

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calculator, Pill, Users, Shield, Smartphone, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pharmacy Assistant</h1>
                <p className="text-sm text-gray-600">Pediatric Dose Calculator</p>
              </div>
            </div>
            
            <Link href="/calculator">
              <Button className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                คำนวณขนาดยา
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            สำหรับเภสัชกรและนักศึกษาเภสัชศาสตร์
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            เครื่องคำนวณ
            <span className="text-blue-600">ขนาดยาเด็ก</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ระบบคำนวณขนาดยาสำหรับเด็กที่แม่นยำ รวดเร็ว และปลอดภัย 
            อิงจากแนวทางปฏิบัติของ TPPG และกรมการแพทย์
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                <Calculator className="w-5 h-5 mr-2" />
                เริ่มคำนวณขนาดยา
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
              <Users className="w-5 h-5 mr-2" />
              เรียนรู้วิธีใช้งาน
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ฟีเจอร์หลัก
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              เครื่องมือครบครันสำหรับการคำนวณขนาดยาเด็กในสถานการณ์จริง
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-blue-600" />
                  </div>
                  คำนวณแม่นยำ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  รองรับการคำนวณทั้งแบบ weight-based และ age-based 
                  พร้อมระบบตรวจสอบความปลอดภัย
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  ใช้ได้ทุกอุปกรณ์
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  รองรับการใช้งานบนมือถือ แท็บเล็ต และคอมพิวเตร์ 
                  พร้อมโหมด offline
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  รวดเร็ว
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  คำนวณผลลัพธ์ได้ภายในไม่กี่วินาที 
                  พร้อมแสดงขั้นตอนการคำนวณที่ชัดเจน
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Drug Categories */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ยาที่รองรับในระบบ
          </h2>
          <p className="text-gray-600 mb-8">
            ครอบคลุมยาพื้นฐานที่ใช้บ่อยในเด็ก
          </p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'ยาแก้ปวดลดไข้',
              'ยาแก้ไอขับเสมหะ', 
              'ยาแก้แพ้แก้คันลดน้ำมูก',
              'ยาระบบทางเดิน',
              'ยาระบบทางเดินหายใจ',
              'ยาอื่นๆ (เพิ่มเติมต่อไป)'
            ].map((category) => (
              <div 
                key={category}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-gray-900">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเริ่มใช้งานแล้ว?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            เริ่มคำนวณขนาดยาเด็กได้ทันที ไม่ต้องสมัครสมาชิก
          </p>
          
          <Link href="/calculator">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Calculator className="w-5 h-5 mr-2" />
              เริ่มใช้งานเครื่องคำนวณ
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Pharmacy Assistant Toolkit</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            พัฒนาโดย Ai-Sat สำหรับนักศึกษาเภสัชศาสตร์และเภสัชกร
          </p>
          
          <div className="text-xs text-gray-500">
            <p>อิงจากแนวทางปฏิบัติ TPPG และกรมการแพทย์</p>
            <p className="mt-1">© 2025 Pharmacy Assistant Toolkit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}