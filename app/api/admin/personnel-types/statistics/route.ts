// app/api/admin/personnel-types/statistics/route.ts
// Personnel Types API - Statistics & Analytics
// API สำหรับสถิติและการวิเคราะห์ประเภทบุคลากร

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ================================
// VALIDATION SCHEMAS
// ================================

const StatisticsQuerySchema = z.object({
  hospitalId: z.string().uuid().optional(),
  includeInactive: z.string().transform((val) => val === 'true').optional(),
  groupBy: z.enum(['hierarchy', 'hospital', 'permissions', 'usage']).default('hierarchy'),
  timeRange: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d')
});

// ================================
// HELPER FUNCTIONS
// ================================

function getDateRange(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

async function getHierarchyStatistics(hospitalId?: string, includeInactive = false) {
  const where = {
    ...(hospitalId && { hospitalId }),
    ...(includeInactive ? {} : { isActive: true })
  };

  const hierarchyStats = await prisma.personnelType.groupBy({
    by: ['hierarchy'],
    _count: { _all: true },
    _avg: { levelOrder: true },
    where
  });

  // ข้อมูลการใช้งานตาม hierarchy - แก้ไขให้ถูกต้อง
  const hierarchyUsage = await prisma.user.count({
    where: {
      personnelTypeId: { not: null },
      personnelType: {
        hierarchy: { in: hierarchyStats.map(h => h.hierarchy) },
        ...(hospitalId && { hospitalId })
      }
    }
  });

  return {
    byHierarchy: hierarchyStats.map(stat => ({
      hierarchy: stat.hierarchy,
      count: stat._count._all,
      averageLevelOrder: Math.round(stat._avg.levelOrder || 0),
      userCount: hierarchyUsage // ใช้ count รวมแทน
    })),
    totalTypes: hierarchyStats.reduce((sum, stat) => sum + stat._count._all, 0)
  };
}

async function getHospitalStatistics(includeInactive = false) {
  const hospitalStats = await prisma.hospital.findMany({
    select: {
      id: true,
      name: true,
      hospitalCode: true,
      status: true,
      _count: {
        select: {
          personnelTypes: {
            where: includeInactive ? {} : { isActive: true }
          },
          users: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return hospitalStats.map(hospital => ({
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    hospitalCode: hospital.hospitalCode,
    status: hospital.status,
    personnelTypeCount: hospital._count.personnelTypes,
    userCount: hospital._count.users,
    averageTypesPerUser: hospital._count.users > 0 
      ? Math.round((hospital._count.personnelTypes / hospital._count.users) * 100) / 100
      : 0
  }));
}

async function getPermissionStatistics(hospitalId?: string) {
  const where = {
    ...(hospitalId && { hospitalId }),
    isActive: true
  };

  const permissions = [
    'canManageHospitals',
    'canManageWarehouses', 
    'canManageDepartments',
    'canManagePersonnel',
    'canManageDrugs',
    'canManageMasterData',
    'canViewReports',
    'canApproveUsers'
  ];

  const permissionStats: Record<string, number> = {};

  for (const permission of permissions) {
    const count = await prisma.personnelType.count({
      where: {
        ...where,
        [permission]: true
      }
    });
    permissionStats[permission] = count;
  }

  return permissionStats;
}

async function getUsageStatistics(hospitalId?: string, timeRange?: string) {
  const since = getDateRange(timeRange || '30d');
  
  const where = {
    ...(hospitalId && { hospitalId }),
    ...(since && { createdAt: { gte: since } })
  };

  // การสร้างประเภทบุคลากรใหม่
  const creationTrend = await prisma.personnelType.findMany({
    where,
    select: {
      createdAt: true,
      hierarchy: true,
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // การใช้งานโดยผู้ใช้ - แก้ไข query
  const userAssignments = await prisma.user.count({
    where: {
      personnelTypeId: { not: null },
      personnelType: {
        ...(hospitalId && { hospitalId })
      },
      ...(since && { 
        OR: [
          { createdAt: { gte: since } },
          { updatedAt: { gte: since } }
        ]
      })
    }
  });

  // ประเภทที่ใช้งานมากที่สุด
  const mostUsedTypes = await prisma.personnelType.findMany({
    where: {
      ...(hospitalId && { hospitalId }),
      isActive: true
    },
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: {
      users: {
        _count: 'desc'
      }
    },
    take: 10
  });

  return {
    creationTrend: creationTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      hierarchy: item.hierarchy,
      isActive: item.isActive
    })),
    totalAssignments: userAssignments,
    mostUsedTypes: mostUsedTypes.map(type => ({
      id: type.id,
      typeName: type.typeName,
      typeCode: type.typeCode,
      hierarchy: type.hierarchy,
      userCount: type._count.users
    })),
    unusedTypes: await prisma.personnelType.count({
      where: {
        ...(hospitalId && { hospitalId }),
        isActive: true,
        users: { none: {} }
      }
    })
  };
}

async function getAdvancedAnalytics(hospitalId?: string) {
  // การกระจายของระดับลำดับชั้น
  const levelDistribution = await prisma.personnelType.groupBy({
    by: ['levelOrder'],
    _count: { _all: true },
    where: {
      ...(hospitalId && { hospitalId }),
      isActive: true
    },
    orderBy: { levelOrder: 'asc' }
  });

  // ความสัมพันธ์ระหว่าง hierarchy และ permissions
  const hierarchyPermissions = await prisma.personnelType.findMany({
    where: {
      ...(hospitalId && { hospitalId }),
      isActive: true
    },
    select: {
      hierarchy: true,
      canManageHospitals: true,
      canManageWarehouses: true,
      canManageDepartments: true,
      canManagePersonnel: true,
      canManageDrugs: true,
      canManageMasterData: true,
      canViewReports: true,
      canApproveUsers: true
    }
  });

  // การวิเคราะห์ responsibilities
  const allResponsibilities = await prisma.personnelType.findMany({
    where: {
      ...(hospitalId && { hospitalId }),
      isActive: true,
      responsibilities: {
        not: Prisma.JsonNull
      }
    },
    select: { responsibilities: true, hierarchy: true }
  });

  const responsibilityStats: Record<string, { count: number; hierarchies: Set<string> }> = {};
  allResponsibilities.forEach(type => {
    if (Array.isArray(type.responsibilities)) {
      (type.responsibilities as string[]).forEach(resp => {
        if (!responsibilityStats[resp]) {
          responsibilityStats[resp] = { count: 0, hierarchies: new Set() };
        }
        responsibilityStats[resp].count++;
        responsibilityStats[resp].hierarchies.add(type.hierarchy);
      });
    }
  });

  // ประมวลผล hierarchyPermissions
  const hierarchyPermissionsSummary: Record<string, {
    total: number;
    permissions: Record<string, number>;
  }> = {};

  hierarchyPermissions.forEach(type => {
    if (!hierarchyPermissionsSummary[type.hierarchy]) {
      hierarchyPermissionsSummary[type.hierarchy] = {
        total: 0,
        permissions: {
          canManageHospitals: 0,
          canManageWarehouses: 0,
          canManageDepartments: 0,
          canManagePersonnel: 0,
          canManageDrugs: 0,
          canManageMasterData: 0,
          canViewReports: 0,
          canApproveUsers: 0
        }
      };
    }
    hierarchyPermissionsSummary[type.hierarchy].total++;
    
    // ตรวจสอบ permissions แต่ละตัว
    const permissions = ['canManageHospitals', 'canManageWarehouses', 'canManageDepartments', 'canManagePersonnel', 'canManageDrugs', 'canManageMasterData', 'canViewReports', 'canApproveUsers'] as const;
    permissions.forEach(perm => {
      if (type[perm]) {
        hierarchyPermissionsSummary[type.hierarchy].permissions[perm]++;
      }
    });
  });

  return {
    levelDistribution: levelDistribution.map(level => ({
      levelOrder: level.levelOrder,
      count: level._count._all
    })),
    hierarchyPermissions: hierarchyPermissionsSummary,
    commonResponsibilities: Object.entries(responsibilityStats)
      .map(([resp, data]) => ({
        responsibility: resp,
        count: data.count,
        hierarchies: Array.from(data.hierarchies)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  };
}

// ================================
// GET HANDLER - Statistics
// ================================
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (!['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงสถิติประเภทบุคลากร' },
        { status: 403 }
      );
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = StatisticsQuerySchema.parse({
      hospitalId: searchParams.get('hospitalId') || undefined,
      includeInactive: searchParams.get('includeInactive') || undefined,
      groupBy: searchParams.get('groupBy') || 'hierarchy',
      timeRange: searchParams.get('timeRange') || '30d'
    });

    const { hospitalId, includeInactive, groupBy, timeRange } = queryParams;

    // ตรวจสอบสิทธิ์เข้าถึงโรงพยาบาล
    const effectiveHospitalId = session.user.role === 'DEVELOPER' 
      ? hospitalId 
      : session.user.hospitalId;

    let statistics = {};

    // สรุปข้อมูลทั่วไป
    const overview = {
      totalTypes: await prisma.personnelType.count({
        where: {
          ...(effectiveHospitalId && { hospitalId: effectiveHospitalId }),
          ...(includeInactive ? {} : { isActive: true })
        }
      }),
      activeTypes: await prisma.personnelType.count({
        where: {
          ...(effectiveHospitalId && { hospitalId: effectiveHospitalId }),
          isActive: true
        }
      }),
      totalUsers: await prisma.user.count({
        where: {
          ...(effectiveHospitalId && { hospitalId: effectiveHospitalId }),
          personnelTypeId: { not: null }
        }
      }),
      systemDefaultTypes: await prisma.personnelType.count({
        where: {
          ...(effectiveHospitalId && { hospitalId: effectiveHospitalId }),
          isSystemDefault: true
        }
      })
    };

    // ข้อมูลตาม groupBy
    switch (groupBy) {
      case 'hierarchy':
        statistics = await getHierarchyStatistics(effectiveHospitalId, includeInactive);
        break;
      case 'hospital':
        if (session.user.role === 'DEVELOPER') {
          statistics = await getHospitalStatistics(includeInactive);
        } else {
          statistics = { error: 'ไม่มีสิทธิ์ดูสถิติแยกตามโรงพยาบาล' };
        }
        break;
      case 'permissions':
        statistics = await getPermissionStatistics(effectiveHospitalId);
        break;
      case 'usage':
        statistics = await getUsageStatistics(effectiveHospitalId, timeRange);
        break;
    }

    // ข้อมูลวิเคราะห์ขั้นสูง (เฉพาะ DEVELOPER และ DIRECTOR)
    let analytics = null;
    if (['DEVELOPER', 'DIRECTOR'].includes(session.user.role)) {
      analytics = await getAdvancedAnalytics(effectiveHospitalId);
    }

    // ข้อมูลเทรนด์ล่าสุด
    const recentActivity = await prisma.personnelType.findMany({
      where: {
        ...(effectiveHospitalId && { hospitalId: effectiveHospitalId }),
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 วันล่าสุด
        }
      },
      select: {
        id: true,
        typeName: true,
        typeCode: true,
        hierarchy: true,
        createdAt: true,
        creator: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        overview,
        statistics,
        analytics,
        recentActivity,
        metadata: {
          groupBy,
          timeRange,
          hospitalId: effectiveHospitalId,
          includeInactive,
          generatedAt: new Date().toISOString(),
          userRole: session.user.role
        }
      }
    });

  } catch (error) {
    console.error('Personnel Types Statistics Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'พารามิเตอร์ไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงสถิติประเภทบุคลากร' },
      { status: 500 }
    );
  }
}