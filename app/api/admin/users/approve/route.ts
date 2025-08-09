// app/api/admin/users/approve/route.ts
// API สำหรับอนุมัติหรือปฏิเสธผู้ใช้ใหม่ (Working Version)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<any> {
  try {
    const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Helper function to get current user from cookies/headers
async function getCurrentUser(request: NextRequest) {
  try {
    // Method 1: Check Better Auth session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token') || 
                         cookieStore.get('auth.session_token') ||
                         cookieStore.get('session');
    
    if (sessionCookie?.value) {
      console.log('🔍 [API] Found session cookie');
      
      // Try to find session in database
      const session = await prisma.session.findFirst({
        where: {
          sessionToken: sessionCookie.value,
          expires: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      });
      
      if (session?.user) {
        console.log('🔍 [API] Found user from session:', session.user.id);
        return session.user;
      }
    }
    
    // Method 2: Check Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔍 [API] Found Bearer token');
      
      const decoded = await verifyToken(token);
      if (decoded?.id || decoded?.userId) {
        const userId = decoded.id || decoded.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          console.log('🔍 [API] Found user from token:', user.id);
          return user;
        }
      }
    }
    
    // Method 3: Check custom auth cookie
    const authCookie = cookieStore.get('auth-token');
    if (authCookie?.value) {
      console.log('🔍 [API] Found custom auth cookie');
      
      const decoded = await verifyToken(authCookie.value);
      if (decoded?.id || decoded?.userId) {
        const userId = decoded.id || decoded.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          console.log('🔍 [API] Found user from custom token:', user.id);
          return user;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ [API] Error getting current user:', error);
    return null;
  }
}

// ตรวจสอบสิทธิ์การอนุมัติ
async function checkApprovalAccess(user: any) {
  // ตรวจสอบสิทธิ์จากบทบาท
  const allowedRoles = [
    'DEVELOPER',
    'HOSPITAL_ADMIN',
    'PHARMACY_MANAGER',
    'DIRECTOR'
  ];

  const hasRoleAccess = user?.status === 'ACTIVE' && 
                        allowedRoles.includes(user.role);
  
  // Check personnel type permissions if exists
  if (user?.personnelTypeId) {
    const personnelType = await prisma.personnelType.findUnique({
      where: { id: user.personnelTypeId },
      select: { canApproveUsers: true }
    });
    
    if (personnelType?.canApproveUsers) {
      return true;
    }
  }

  return hasRoleAccess;
}

// Validation schema
interface ApprovalRequest {
  userId: string;
  action: 'approve' | 'reject';
  assignRole?: string;
  reason?: string;
}

function validateRequest(body: any): ApprovalRequest | null {
  if (!body.userId || typeof body.userId !== 'string') {
    return null;
  }

  if (!body.action || !['approve', 'reject'].includes(body.action)) {
    return null;
  }

  if (body.action === 'reject' && !body.reason) {
    return null;
  }

  return {
    userId: body.userId,
    action: body.action,
    assignRole: body.assignRole,
    reason: body.reason
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 [API] POST /api/admin/users/approve - Starting');

    // Get current user
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      console.log('❌ [API] No user found from session/token');
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    console.log('📋 [API] Current user:', {
      id: currentUser.id,
      role: currentUser.role,
      name: currentUser.name
    });

    // ตรวจสอบสิทธิ์
    const hasAccess = await checkApprovalAccess(currentUser);
    
    if (!hasAccess) {
      console.log('❌ [API] Access denied for user:', currentUser.id);
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์อนุมัติผู้ใช้' },
        { status: 403 }
      );
    }

    // Parse และ validate request body
    const body = await request.json();
    const validatedData = validateRequest(body);

    if (!validatedData) {
      console.log('❌ [API] Invalid request data:', body);
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    console.log('📋 [API] Processing:', validatedData);

    // ดึงข้อมูลผู้ใช้ที่จะอนุมัติ
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        hospitalId: true
      }
    });

    if (!targetUser) {
      console.log('❌ [API] User not found:', validatedData.userId);
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าผู้ใช้อยู่ในสถานะ PENDING
    if (targetUser.status !== 'PENDING') {
      console.log('❌ [API] User not in PENDING status:', targetUser.status);
      return NextResponse.json(
        { error: 'ผู้ใช้ไม่อยู่ในสถานะรอการอนุมัติ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า admin และ user อยู่โรงพยาบาลเดียวกัน
    if (currentUser.hospitalId !== targetUser.hospitalId) {
      console.log('❌ [API] Hospital mismatch');
      return NextResponse.json(
        { error: 'ไม่สามารถอนุมัติผู้ใช้ต่างโรงพยาบาลได้' },
        { status: 403 }
      );
    }

    // เริ่ม transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedUser;

      if (validatedData.action === 'approve') {
        // อนุมัติผู้ใช้
        console.log('✅ [API] Approving user:', targetUser.id);
        
        const updateData: any = {
          status: 'ACTIVE',
          approvedAt: new Date(),
          approvedBy: currentUser.id,
          statusChangedAt: new Date(),
          lastModifiedBy: currentUser.id,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null
        };

        // เปลี่ยนบทบาทถ้าระบุ
        if (validatedData.assignRole) {
          // ตรวจสอบว่า role ที่ระบุถูกต้อง
          const validRoles = [
            'DEVELOPER', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER',
            'SENIOR_PHARMACIST', 'STAFF_PHARMACIST', 'DEPARTMENT_HEAD',
            'STAFF_NURSE', 'PHARMACY_TECHNICIAN', 'DIRECTOR',
            'GROUP_HEAD', 'STAFF', 'STUDENT'
          ];
          
          if (validRoles.includes(validatedData.assignRole)) {
            updateData.role = validatedData.assignRole;
            console.log('📋 [API] Assigning role:', validatedData.assignRole);
          }
        }

        // อัพเดทประวัติสถานะ
        const currentUserData = await tx.user.findUnique({
          where: { id: targetUser.id },
          select: { statusHistory: true }
        });

        const statusHistory = currentUserData?.statusHistory as any[] || [];
        statusHistory.push({
          status: 'ACTIVE',
          changedAt: new Date(),
          changedBy: currentUser.id,
          action: 'APPROVED',
          role: updateData.role || targetUser.role,
          notes: body.approvalNotes
        });

        updateData.statusHistory = statusHistory;

        updatedUser = await tx.user.update({
          where: { id: targetUser.id },
          data: updateData
        });

        // สร้างการแจ้งเตือน (ถ้ามี table notification)
        try {
          await tx.notification.create({
            data: {
              hospitalId: targetUser.hospitalId,
              type: 'USER_CREATED',
              priority: 'NORMAL',
              title: 'บัญชีผู้ใช้ได้รับการอนุมัติ',
              message: `บัญชีของคุณได้รับการอนุมัติแล้ว คุณสามารถเข้าใช้งานระบบได้`,
              targetUsers: [targetUser.id],
              sendEmail: true,
              sendInApp: true,
              status: 'PENDING'
            }
          });
        } catch (notificationError) {
          console.log('⚠️ [API] Could not create notification:', notificationError);
        }

      } else {
        // ปฏิเสธผู้ใช้
        console.log('❌ [API] Rejecting user:', targetUser.id);
        
        const updateData: any = {
          status: 'SUSPENDED',
          rejectedAt: new Date(),
          rejectedBy: currentUser.id,
          rejectionReason: validatedData.reason,
          statusChangedAt: new Date(),
          lastModifiedBy: currentUser.id
        };

        // อัพเดทประวัติสถานะ
        const currentUserData = await tx.user.findUnique({
          where: { id: targetUser.id },
          select: { statusHistory: true }
        });

        const statusHistory = currentUserData?.statusHistory as any[] || [];
        statusHistory.push({
          status: 'SUSPENDED',
          changedAt: new Date(),
          changedBy: currentUser.id,
          action: 'REJECTED',
          reason: validatedData.reason
        });

        updateData.statusHistory = statusHistory;

        updatedUser = await tx.user.update({
          where: { id: targetUser.id },
          data: updateData
        });

        // สร้างการแจ้งเตือน (ถ้ามี table notification)
        try {
          await tx.notification.create({
            data: {
              hospitalId: targetUser.hospitalId,
              type: 'USER_CREATED',
              priority: 'HIGH',
              title: 'คำขอสมัครถูกปฏิเสธ',
              message: `คำขอสมัครของคุณถูกปฏิเสธ เหตุผล: ${validatedData.reason}`,
              targetUsers: [targetUser.id],
              sendEmail: true,
              sendInApp: true,
              status: 'PENDING'
            }
          });
        } catch (notificationError) {
          console.log('⚠️ [API] Could not create notification:', notificationError);
        }
      }

      // บันทึก Audit Log (ถ้ามี table auditLog)
      try {
        await tx.auditLog.create({
          data: {
            hospitalId: targetUser.hospitalId,
            userId: currentUser.id,
            action: validatedData.action === 'approve' ? 'USER_APPROVED' as any : 'USER_REJECTED' as any,
            entityType: 'User',
            entityId: targetUser.id,
            description: validatedData.action === 'approve' 
              ? `อนุมัติผู้ใช้ ${targetUser.name} (${targetUser.email})`
              : `ปฏิเสธผู้ใช้ ${targetUser.name} (${targetUser.email})`,
            oldValues: {
              status: targetUser.status,
              role: targetUser.role
            },
            newValues: {
              status: updatedUser.status,
              role: updatedUser.role,
              approvedBy: validatedData.action === 'approve' ? currentUser.id : null,
              rejectedBy: validatedData.action === 'reject' ? currentUser.id : null,
              reason: validatedData.reason
            },
            severity: 'INFO',
            category: 'USER_MANAGEMENT',
            tags: ['user-approval', validatedData.action],
            ipAddress: request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        });
      } catch (auditError) {
        console.log('⚠️ [API] Could not create audit log:', auditError);
      }

      return updatedUser;
    });

    console.log('✅ [API] Successfully processed user approval/rejection');

    return NextResponse.json({
      success: true,
      message: validatedData.action === 'approve' 
        ? 'อนุมัติผู้ใช้สำเร็จ' 
        : 'ปฏิเสธผู้ใช้สำเร็จ',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        status: result.status,
        role: result.role
      }
    });

  } catch (error) {
    console.error('❌ [API] Error processing approval:', error);
    
    // ตรวจสอบ error จาก Prisma
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'ข้อมูลซ้ำกัน' },
          { status: 400 }
        );
      }
      if (error.message.includes('P2025')) {
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการดำเนินการ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}