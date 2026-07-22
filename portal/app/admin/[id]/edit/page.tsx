import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateApp } from '../../actions';

export default async function EditAppPage({ params }: { params: { id: string } }) {
  const app = await prisma.app.findUnique({ where: { id: params.id } });
  if (!app) notFound();

  const updateWithId = updateApp.bind(null, app.id);

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <div className="section-title" style={{ marginTop: 0 }}>
        앱 수정
      </div>
      <form action={updateWithId} className="form" encType="multipart/form-data">
        <label>
          이름
          <input name="name" required defaultValue={app.name} />
        </label>
        <label>
          설명
          <textarea name="description" rows={2} defaultValue={app.description} />
        </label>
        <label>
          이동할 URL
          <input name="externalUrl" required defaultValue={app.externalUrl} />
        </label>
        <label>
          정렬 순서
          <input name="sortOrder" type="number" defaultValue={app.sortOrder} />
        </label>
        {app.thumbnailUrl && (
          <label>
            현재 썸네일
            <img src={app.thumbnailUrl} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
          </label>
        )}
        <label>
          새 썸네일 이미지 업로드 (선택, 바꿀 때만)
          <input name="thumbnailFile" type="file" accept="image/*" />
        </label>
        <label>
          또는 썸네일 이미지 URL 교체 (선택)
          <input name="thumbnailUrl" placeholder="https://..." />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">
            저장
          </button>
          <a className="btn secondary" href="/admin" style={{ textDecoration: 'none', textAlign: 'center' }}>
            취소
          </a>
        </div>
      </form>
    </div>
  );
}
