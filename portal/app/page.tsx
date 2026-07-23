import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/TopBar';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const apps = await prisma.app.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="page">
      <TopBar email={session?.user?.email} />

      {apps.length === 0 ? (
        <div className="empty-state">
          아직 등록된 앱이 없습니다. <br />
          <a href="/admin">앱 관리</a>에서 첫 앱을 추가해보세요.
        </div>
      ) : (
        <div className="app-grid">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.downloadUrl ?? app.externalUrl}
              download={app.downloadUrl ? true : undefined}
              className="app-card"
            >
              <div
                className="thumb"
                style={app.thumbnailUrl ? { backgroundImage: `url(${app.thumbnailUrl})` } : undefined}
              >
                {!app.thumbnailUrl && app.name.slice(0, 1)}
              </div>
              <div className="meta">
                {app.downloadUrl && <div className="badge">다운로드</div>}
                <div className="name">{app.name}</div>
                <div className="desc">{app.description}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
