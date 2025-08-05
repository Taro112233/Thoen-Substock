// app/api/admin/warehouses/managers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

// GET - รายการผู้ใช้ที่สามารถเป็นผู้จัดการคลังได้
export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const availableManagers = await prisma.user.findMany({
      where: {
        hospitalId: user.hospitalId,
        isActive: true,
        role: {
          in: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'SENIOR_PHARMACIST', 'STAFF_PHARMACIST']
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        position: true,
        _count: {
          select: {
            warehousesManaged: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Add computed fields
    const managersWithDetails = availableManagers.map(manager => ({
      ...manager,
      fullName: `${manager.firstName} ${manager.lastName}`,
      warehouseCount: manager._count.warehousesManaged,
    }));

    return NextResponse.json({
      managers: managersWithDetails,
      total: managersWithDetails.length,
    });

  } catch (error) {
    console.error('[AVAILABLE_MANAGERS_GET]', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้จัดการ' 
    }, { status: 500 });
  }
}