// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // เปิดใช้งาน email และ password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // ปิดเพื่อให้ workflow ง่ายขึ้น
  },
  
  // การตั้งค่า session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 วัน
    updateAge: 60 * 60 * 24, // อัปเดตทุก 1 วัน
  },
  
  // การตั้งค่า JWT
  jwt: {
    expiresIn: 60 * 60 * 24 * 7, // 7 วัน
  },
  
  // Custom user model fields
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      position: {
        type: "string",
        required: false,
      },
      hospitalId: {
        type: "string",
        required: true,
      },
      departmentId: {
        type: "string", 
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "STAFF_NURSE",
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "PENDING",
      },
      isProfileComplete: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
    },
  },
  
  // Hooks สำหรับ custom logic
  hooks: {
    after: [
      {
        matcher: (context) => {
          return context.path === "/sign-up" && context.method === "POST";
        },
        handler: async (context) => {
          // Auto login หลังจากสมัครสำเร็จ
          if (context.returned?.user) {
            // จะถูกจัดการใน frontend
            console.log("User registered:", context.returned.user.id);
          }
        },
      },
    ],
  },
  
  // Rate limiting
  rateLimit: {
    window: 60, // 1 นาที
    max: 10, // สูงสุด 10 attempts
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;