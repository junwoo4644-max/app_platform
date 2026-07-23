import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/dataDir';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
};

// These force a download instead of the browser trying to render them inline.
const DOWNLOAD_EXTENSIONS = new Set(['.zip']);

export async function GET(_req: NextRequest, { params }: { params: { filename: string } }) {
  // path.basename strips any directory components so this can't escape UPLOADS_DIR.
  const filename = path.basename(params.filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new NextResponse('Not found', { status: 404 });

  try {
    const data = await readFile(path.join(UPLOADS_DIR, filename));
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
    if (DOWNLOAD_EXTENSIONS.has(ext)) {
      // Stored as "<uuid>__<original-name>" -- recover the original name for the download prompt.
      const separatorIndex = filename.indexOf('__');
      const displayName = separatorIndex === -1 ? filename : filename.slice(separatorIndex + 2);
      headers['Content-Disposition'] = `attachment; filename="${displayName.replace(/"/g, '')}"`;
    }
    return new NextResponse(data, { headers });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
