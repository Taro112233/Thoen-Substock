// lib/prisma.ts
// Prisma Client Singleton Pattern for Next.js
// ป้องกันการสร้าง instance ซ้ำในระหว่าง development

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Middleware สำหรับ inject hospital context อัตโนมัติ
prisma.$use(async (params, next) => {
  // ตรวจสอบว่ามี hospitalId ใน where clause หรือไม่
  if (params.model && params.args?.where) {
    // Models ที่ต้องการ hospital context
    const modelsRequiringHospital = [
      'User',
      'Department', 
      'Warehouse',
      'Drug',
      'StockCard',
      'StockTransaction',
      'Requisition',
      'PurchaseOrder',
      'GoodsReceipt'
    ];

    if (modelsRequiringHospital.includes(params.model)) {
      // ตรวจสอบว่ามี hospitalId หรือไม่
      if (!params.args.where.hospitalId && process.env.NODE_ENV === 'development') {
        console.warn(
          `⚠️ Warning: Query on ${params.model} without hospitalId filter. ` +
          `This may expose data from other hospitals.`
        );
      }
    }
  }

  // Log slow queries in development
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected (${duration}ms):`, {
        model: params.model,
        action: params.action,
        duration: `${duration}ms`
      });
    }
    
    return result;
  }

  return next(params);
});

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}