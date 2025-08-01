// app/api/auth/login/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });
    if (!user || !user.accounts[0]?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.accounts[0].password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const cookie = serialize('token', token, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 