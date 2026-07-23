import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/TopBar';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string | null; role?: string } | undefined;
  const apps = await prisma.app.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="page">
      <TopBar email={user?.email} role={user?.role} />

      <div className="store-hero">
        <h1>My Apps</h1>
        <p>만든 앱들을 모아둔 공간입니다. 눌러서 살펴보고, 로그인하면 열거나 다운로드할 수 있어요.</p>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">아직 등록된 앱이 없습니다.</div>
      ) : (
        <div className="app-grid">
          {apps.map((app) => (
            <a key={app.id} href={`/apps/${app.slug}`} className="app-card">
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
