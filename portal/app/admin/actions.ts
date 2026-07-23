'use server';

import { revalidatePath } from 'next/cache';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { UPLOADS_DIR } from '@/lib/dataDir';

// Stored as "<uuid>__<original-name>" so the download route can recover a
// human-readable filename without a DB lookup.
async function saveUpload(file: File): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
  const filename = `${randomUUID()}__${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function resolveFileUrl(
  formData: FormData,
  fileField: string,
  urlField: string,
  existing?: string | null
): Promise<string | null> {
  const file = formData.get(fileField);
  if (file instanceof File && file.size > 0) {
    return saveUpload(file);
  }
  const url = (formData.get(urlField) as string | null)?.trim();
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

async function unlinkIfUploaded(url: string | null) {
  if (url?.startsWith('/uploads/')) {
    await unlink(path.join(UPLOADS_DIR, path.basename(url))).catch(() => {});
  }
}

export async function createApp(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const description = ((formData.get('description') as string) ?? '').trim();
  const externalUrl = (formData.get('externalUrl') as string)?.trim();
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0;

  if (!name || !externalUrl) throw new Error('이름과 URL은 필수입니다.');

  const slug = await uniqueSlug(name);
  const thumbnailUrl = await resolveFileUrl(formData, 'thumbnailFile', 'thumbnailUrl');
  const downloadUrl = await resolveFileUrl(formData, 'downloadFile', 'downloadUrl');

  await prisma.app.create({
    data: { name, description, externalUrl, sortOrder, slug, thumbnailUrl, downloadUrl },
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
  const thumbnailUrl = await resolveFileUrl(formData, 'thumbnailFile', 'thumbnailUrl', existing.thumbnailUrl);
  const downloadUrl = await resolveFileUrl(formData, 'downloadFile', 'downloadUrl', existing.downloadUrl);

  if (thumbnailUrl !== existing.thumbnailUrl) await unlinkIfUploaded(existing.thumbnailUrl);
  if (downloadUrl !== existing.downloadUrl) await unlinkIfUploaded(existing.downloadUrl);

  await prisma.app.update({
    where: { id },
    data: { name, description, externalUrl, sortOrder, slug, thumbnailUrl, downloadUrl },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteApp(formData: FormData) {
  const id = formData.get('id') as string;
  const app = await prisma.app.findUnique({ where: { id } });
  if (!app) return;

  await prisma.app.delete({ where: { id } });

  await unlinkIfUploaded(app.thumbnailUrl);
  await unlinkIfUploaded(app.downloadUrl);

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
