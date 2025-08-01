// app/api/auth/register/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        accounts: {
          create: {
            accountId: email,
            providerId: 'credentials',
            password: hashed,
            createdAt: now,
            updatedAt: now,
          },
        },
      },
      include: { accounts: true },
    });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const cookie = serialize('token', token, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}