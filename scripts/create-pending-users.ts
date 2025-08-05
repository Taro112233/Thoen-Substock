// scripts/create-pending-users.ts
// สคริปต์สร้างผู้ใช้ทดสอบที่รอการอนุมัติ (Complete Version)

// โหลด environment variables ก่อนเสมอ
import dotenv from 'dotenv';
import path from 'path';

// โหลดจาก .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับ hash password ด้วย crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createPendingUsers() {
  try {
    console.log('🔍 Checking environment variables...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing');
    console.log('DIRECT_URL:', process.env.DIRECT_URL ? '✅ Loaded' : '❌ Missing');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('🔍 Looking for hospital and departments...');
    
    // ดึงข้อมูล hospital และ department
    const hospital = await prisma.hospital.findFirst({
      where: { hospitalCode: 'DEMO_HOSPITAL' }
    });

    if (!hospital) {
      console.log('❌ ไม่พบโรงพยาบาล DEMO_HOSPITAL');
      console.log('🔍 กำลังค้นหาโรงพยาบาลที่มี...');
      
      const hospitals = await prisma.hospital.findMany({
        select: { id: true, name: true, hospitalCode: true }
      });
      
      console.log('🏥 โรงพยาบาลที่พบ:', hospitals);
      
      if (hospitals.length === 0) {
        throw new Error('ไม่พบโรงพยาบาลใดในระบบ กรุณาสร้างข้อมูลโรงพยาบาลก่อน');
      }
      
      // ใช้โรงพยาบาลแรกที่พบ
      const firstHospital = hospitals[0];
      console.log(`📍 ใช้โรงพยาบาล: ${firstHospital.name} (${firstHospital.hospitalCode})`);
      
      await createPendingUsersForHospital(firstHospital.id);
      return;
    }

    await createPendingUsersForHospital(hospital.id);

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error instanceof Error && error.message.includes('Environment variable not found')) {
      console.log('\n💡 แก้ไข:');
      console.log('1. ตรวจสอบไฟล์ .env.local ใน root directory');
      console.log('2. ใส่ DATABASE_URL และ DIRECT_URL');
      console.log('3. หรือรัน: DATABASE_URL="your-url" npx tsx scripts/create-pending-users.ts');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function createPendingUsersForHospital(hospitalId: string) {
  try {
    // ค้นหาแผนกในโรงพยาบาล
    const departments = await prisma.department.findMany({
      where: { hospitalId },
      select: { id: true, name: true, departmentCode: true }
    });

    console.log('🏢 แผนกที่พบ:', departments.map(d => `${d.name} (${d.departmentCode})`));

    const pharmacy = departments.find(d => d.departmentCode === 'PHARMACY') || departments[0];
    const internalMed = departments.find(d => d.departmentCode === 'INTERNAL_MED') || departments[1] || departments[0];

    if (!pharmacy) {
      throw new Error('ไม่พบแผนกในโรงพยาบาล กรุณาสร้างข้อมูลแผนกก่อน');
    }

    console.log('📋 กำลังสร้างผู้ใช้ทดสอบ...');

    // สร้างผู้ใช้ทดสอบที่รอการอนุมัติ
    const pendingUsers = [
      {
        name: 'นายสมชาย ใจดี',
        email: 'somchai@demo-hospital.th',
        username: 'somchai2025',
        password: hashPassword('password123'),
        role: 'STAFF_PHARMACIST' as const,
        employeeId: 'PH2025001',
        phoneNumber: '081-234-5678',
        position: 'เภสัชกรประจำ',
        hospitalId: hospitalId,
        departmentId: pharmacy.id,
        status: 'PENDING' as const,
        isProfileComplete: true
      },
      {
        name: 'นางสาวมานี รักงาน',
        email: 'manee@demo-hospital.th',
        username: 'manee2025',
        password: hashPassword('password123'),
        role: 'STAFF_NURSE' as const,
        employeeId: 'NS2025001',
        phoneNumber: '081-345-6789',
        position: 'พยาบาลประจำ',
        hospitalId: hospitalId,
        departmentId: internalMed.id,
        status: 'PENDING' as const,
        isProfileComplete: true
      },
      {
        name: 'นายวิชัย เก่งมาก',
        email: 'wichai@demo-hospital.th',
        username: 'wichai2025',
        password: hashPassword('password123'),
        role: 'PHARMACY_TECHNICIAN' as const,
        employeeId: 'PT2025001',
        phoneNumber: '081-456-7890',
        position: 'เทคนิคเภสัชกรรม',
        hospitalId: hospitalId,
        departmentId: pharmacy.id,
        status: 'PENDING' as const,
        isProfileComplete: true
      }
    ];

    // สร้างผู้ใช้ในฐานข้อมูล
    for (const userData of pendingUsers) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: userData
          });
          console.log(`✅ สร้างผู้ใช้ ${userData.name} (${userData.email}) สำเร็จ`);
        } else {
          console.log(`⚠️  ผู้ใช้ ${userData.email} มีอยู่แล้ว`);
        }
      } catch (userError) {
        console.error(`❌ เกิดข้อผิดพลาดในการสร้างผู้ใช้ ${userData.name}:`, userError);
      }
    }

    console.log('\n🎉 สร้างผู้ใช้ทดสอบเสร็จสิ้น!');
    console.log('\n📋 ข้อมูลผู้ใช้ทดสอบ:');
    console.log('- Email: somchai@demo-hospital.th, Password: password123');
    console.log('- Email: manee@demo-hospital.th, Password: password123');
    console.log('- Email: wichai@demo-hospital.th, Password: password123');
    console.log('\n🔗 ทดสอบที่: http://localhost:3000/admin/users/pending');
    console.log('🔑 Login ด้วย: admin@demo-hospital.th / admin123');

  } catch (error) {
    console.error('❌ Error in createPendingUsersForHospital:', error);
    throw error;
  }
}

// เรียกใช้ function
createPendingUsers();