// lib/auth-options.ts - Fixed TypeScript Errors
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './password-utils';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('อีเมลและรหัสผ่านจำเป็น');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              hospital: true,
              personnelType: true,
              department: true,
            },
          });

          if (!user) {
            throw new Error('ไม่พบผู้ใช้หรืออีเมลไม่ถูกต้อง');
          }

          // ตรวจสอบรหัสผ่าน
          if (!user.password) {
            throw new Error('บัญชีนี้ไม่มีรหัสผ่าน');
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password);
          if (!isValidPassword) {
            throw new Error('รหัสผ่านไม่ถูกต้อง');
          }

          // ตรวจสอบสถานะบัญชี
          if (user.status === 'PENDING') {
            throw new Error('บัญชีของคุณรอการอนุมัติ');
          }
          
          if (user.status !== 'ACTIVE') {
            const statusMessages = {
              INACTIVE: 'บัญชีของคุณถูกปิดการใช้งาน',
              SUSPENDED: 'บัญชีของคุณถูกระงับ',
              DELETED: 'บัญชีของคุณถูกลบ',
            };
            throw new Error(statusMessages[user.status as keyof typeof statusMessages] || 'บัญชีไม่สามารถใช้งานได้');
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
              loginCount: { increment: 1 },
            },
          });

          // Log successful login
          await prisma.loginAttempt.create({
            data: {
              userId: user.id,
              email: credentials.email,
              ipAddress: 'unknown', // จะถูก update ใน middleware
              success: true,
            },
          });

          // Return ตาม NextAuth User type
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hospitalId: user.hospitalId,
            departmentId: user.departmentId || undefined, // Convert null to undefined
            isProfileComplete: user.isProfileComplete,
            status: user.status,
            hospital: user.hospital,
            personnelType: user.personnelType,
          };

        } catch (error: any) {
          console.error('Auth error:', error);
          
          // Log failed login attempt
          if (credentials.email) {
            await prisma.loginAttempt.create({
              data: {
                email: credentials.email,
                ipAddress: 'unknown',
                success: false,
                failureReason: error.message,
              },
            }).catch(console.error);
          }
          
          throw new Error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.hospitalId = user.hospitalId;
        token.departmentId = user.departmentId;
        token.isProfileComplete = user.isProfileComplete;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hospitalId = token.hospitalId as string;
        session.user.departmentId = token.departmentId as string | undefined;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User ${user.email} signed in`);
    },
    async signOut({ token }) {
      if (token?.sub) {
        await prisma.auditLog.create({
          data: {
            hospitalId: token.hospitalId as string,
            userId: token.sub,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: token.sub,
            description: 'ออกจากระบบ',
          },
        }).catch(console.error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};