// types/next-auth.d.ts - Fixed Type Definitions
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      hospitalId: string;
      departmentId?: string; // Optional instead of null
      isProfileComplete: boolean;
      status: string; // Add status field
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    hospitalId: string;
    departmentId?: string; // Optional instead of null
    isProfileComplete: boolean;
    status: string; // Add status field
    // Additional fields from Prisma query
    hospital?: any;
    personnelType?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    hospitalId: string;
    departmentId?: string; // Optional instead of null
    isProfileComplete: boolean;
    status: string; // Add status field
  }
}