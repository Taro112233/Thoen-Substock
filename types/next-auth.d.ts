// types/next-auth.d.ts
// Type definitions for NextAuth session
// ขยาย types เพื่อรองรับ custom fields ใน session

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      hospitalId: string;
      departmentId?: string;
      isProfileComplete: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    hospitalId: string;
    departmentId?: string;
    isProfileComplete: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    hospitalId: string;
    departmentId?: string;
    isProfileComplete: boolean;
  }
}