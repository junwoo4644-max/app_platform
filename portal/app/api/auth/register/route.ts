import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || password.length < 8) {
    return NextResponse.json({ error: '이메일과 8자 이상 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hash, role: 'user' } });

  return NextResponse.json({ ok: true });
}
