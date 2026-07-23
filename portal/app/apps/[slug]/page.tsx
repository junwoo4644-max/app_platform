import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/TopBar';

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string | null; role?: string } | undefined;

  const app = await prisma.app.findUnique({ where: { slug: params.slug } });
  if (!app || !app.isActive) notFound();

  const isDownload = !!app.downloadUrl;
  const actionUrl = app.downloadUrl ?? app.externalUrl;

  return (
    <div className="page">
      <TopBar email={user?.email} role={user?.role} />

      <a href="/" className="back-link">
        ← 앱 목록
      </a>

      <div className="detail-panel">
        <div
          className="detail-thumb"
          style={app.thumbnailUrl ? { backgroundImage: `url(${app.thumbnailUrl})` } : undefined}
        >
          {!app.thumbnailUrl && app.name.slice(0, 1)}
        </div>
        <div className="detail-body">
          <div className="detail-name">{app.name}</div>
          <div className="detail-desc">{app.description || '설명이 없습니다.'}</div>
          <a href={actionUrl} download={isDownload ? true : undefined} className="btn detail-action">
            {isDownload ? '다운로드' : '열기'}
          </a>
        </div>
      </div>
    </div>
  );
}
