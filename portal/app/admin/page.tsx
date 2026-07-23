import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/TopBar';
import AdminNav from '@/components/AdminNav';
import { createApp, deleteApp, toggleActive } from './actions';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string | null; role?: string } | undefined;
  const apps = await prisma.app.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });

  return (
    <div className="page">
      <TopBar email={user?.email} role={user?.role} isAdminPage />
      <AdminNav active="apps" />

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>
          새 앱 추가
        </div>
        <form action={createApp} className="form" encType="multipart/form-data">
          <label>
            이름
            <input name="name" required placeholder="예: Leaf Area" />
          </label>
          <label>
            설명
            <textarea name="description" rows={2} placeholder="한 줄 설명" />
          </label>
          <label>
            이동할 URL
            <input name="externalUrl" required placeholder="http://<서버 IP>:8081" />
          </label>
          <label>
            정렬 순서 (작을수록 먼저 표시, 기본 0)
            <input name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label>
            썸네일 이미지 업로드 (선택)
            <input name="thumbnailFile" type="file" accept="image/*" />
          </label>
          <label>
            또는 썸네일 이미지 URL (선택, 업로드가 없을 때 사용)
            <input name="thumbnailUrl" placeholder="https://..." />
          </label>
          <label>
            다운로드 파일 업로드 (선택, zip 등 — 있으면 카드 클릭 시 이동 대신 다운로드)
            <input name="downloadFile" type="file" />
          </label>
          <label>
            또는 다운로드 URL 직접 입력 (선택, 업로드가 없을 때 사용)
            <input name="downloadUrl" placeholder="https://..." />
          </label>
          <button className="btn" type="submit">
            추가
          </button>
        </form>
      </div>

      <div className="section-title">등록된 앱</div>
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>이름</th>
            <th>URL</th>
            <th>다운로드</th>
            <th>순서</th>
            <th>상태</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app.id}>
              <td>{app.thumbnailUrl ? <img src={app.thumbnailUrl} alt="" /> : null}</td>
              <td>{app.name}</td>
              <td>
                <a href={app.externalUrl} target="_blank" rel="noreferrer">
                  {app.externalUrl}
                </a>
              </td>
              <td>
                {app.downloadUrl ? (
                  <a href={app.downloadUrl} target="_blank" rel="noreferrer">
                    있음
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td>{app.sortOrder}</td>
              <td>{app.isActive ? '표시됨' : '숨김'}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <a href={`/admin/${app.id}/edit`}>수정</a>
                <form action={toggleActive}>
                  <input type="hidden" name="id" value={app.id} />
                  <button className="btn secondary" type="submit" style={{ padding: '4px 10px' }}>
                    {app.isActive ? '숨기기' : '보이기'}
                  </button>
                </form>
                <form action={deleteApp}>
                  <input type="hidden" name="id" value={app.id} />
                  <button className="btn danger" type="submit" style={{ padding: '4px 10px' }}>
                    삭제
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
