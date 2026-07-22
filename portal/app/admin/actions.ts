'use server';

import { revalidatePath } from 'next/cache';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { UPLOADS_DIR } from '@/lib/dataDir';

async function saveThumbnail(file: File): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(file.name) || '.png';
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function resolveThumbnailUrl(formData: FormData, existing?: string | null): Promise<string | null> {
  const file = formData.get('thumbnailFile');
  if (file instanceof File && file.size > 0) {
    return saveThumbnail(file);
  }
  const url = (formData.get('thumbnailUrl') as string | null)?.trim();
  if (url) return url;
  return existing ?? null;
}

async function uniqueSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await prisma.app.findFirst({ where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function createApp(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const description = ((formData.get('description') as string) ?? '').trim();
  const externalUrl = (formData.get('externalUrl') as string)?.trim();
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;

  if (!name || !externalUrl) throw new Error('이름과 URL은 필수입니다.');

  const slug = await uniqueSlug(name);
  const thumbnailUrl = await resolveThumbnailUrl(formData);

  await prisma.app.create({
    data: { name, description, externalUrl, sortOrder, slug, thumbnailUrl },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateApp(id: string, formData: FormData) {
  const existing = await prisma.app.findUniqueOrThrow({ where: { id } });

  const name = (formData.get('name') as string)?.trim();
  const description = ((formData.get('description') as string) ?? '').trim();
  const externalUrl = (formData.get('externalUrl') as string)?.trim();
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;

  if (!name || !externalUrl) throw new Error('이름과 URL은 필수입니다.');

  const slug = name === existing.name ? existing.slug : await uniqueSlug(name, id);
  const thumbnailUrl = await resolveThumbnailUrl(formData, existing.thumbnailUrl);

  await prisma.app.update({
    where: { id },
    data: { name, description, externalUrl, sortOrder, slug, thumbnailUrl },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteApp(formData: FormData) {
  const id = formData.get('id') as string;
  const app = await prisma.app.findUnique({ where: { id } });
  if (!app) return;

  await prisma.app.delete({ where: { id } });

  if (app.thumbnailUrl?.startsWith('/uploads/')) {
    await unlink(path.join(UPLOADS_DIR, path.basename(app.thumbnailUrl))).catch(() => {});
  }

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function toggleActive(formData: FormData) {
  const id = formData.get('id') as string;
  const app = await prisma.app.findUniqueOrThrow({ where: { id } });
  await prisma.app.update({ where: { id }, data: { isActive: !app.isActive } });

  revalidatePath('/admin');
  revalidatePath('/');
}
