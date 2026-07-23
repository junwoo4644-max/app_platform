'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function currentUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function setUserRole(formData: FormData) {
  const id = formData.get('id') as string;
  const role = formData.get('role') as string;
  if (role !== 'admin' && role !== 'user') throw new Error('알 수 없는 역할입니다.');

  if (id === (await currentUserId())) {
    throw new Error('본인 계정의 역할은 바꿀 수 없습니다.');
  }

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath('/admin/users');
}

export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string;

  if (id === (await currentUserId())) {
    throw new Error('본인 계정은 삭제할 수 없습니다.');
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath('/admin/users');
}
