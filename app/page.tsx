// app/page.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pill, Calculator } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Simple Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
            <Pill className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Pharmacy Assistant Toolkit
        </h1>
        
        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-medium mb-8">
          📌 Landing Page
        </div>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          เครื่องมือช่วยเหลือนักศึกษาเภสัชศาสตร์และเภสัชกร<br />
          สำหรับการคำนวณขนาดยาเด็กและแนวทางการรักษา
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/calculator">
          <Button size="lg" className="flex items-center gap-2 text-lg px-8 py-4">
            <Calculator className="w-5 h-5" />
            เข้าสู่ระบบคำนวณ
          </Button>
        </Link>
        
        <Link href="/showcase">
          <Button size="lg" variant="outline" className="text-lg px-8 py-4">
            ดู Component Showcase
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-500">
        <p>พัฒนาโดย Ai-Sat • Pharmacy Student & Developer</p>
      </div>
    </div>
  );
}