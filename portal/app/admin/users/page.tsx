import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/TopBar';
import AdminNav from '@/components/AdminNav';
import { setUserRole, deleteUser } from './actions';

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string | null; role?: string; id?: string } | undefined;
  const users = await prisma.user.findMany({ orderBy: [{ createdAt: 'asc' }] });

  return (
    <div className="page">
      <TopBar email={user?.email} role={user?.role} isAdminPage />
      <AdminNav active="users" />

      <div className="section-title" style={{ marginTop: 0 }}>
        가입자 목록
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>이메일</th>
            <th>역할</th>
            <th>가입일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === user?.id;
            return (
              <tr key={u.id}>
                <td>
                  {u.email}
                  {isSelf && <span className="self-tag"> (나)</span>}
                </td>
                <td>{u.role === 'admin' ? '관리자' : '일반'}</td>
                <td>{u.createdAt.toISOString().slice(0, 10)}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {!isSelf && (
                    <>
                      <form action={setUserRole}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="role" value={u.role === 'admin' ? 'user' : 'admin'} />
                        <button className="btn secondary" type="submit" style={{ padding: '4px 10px' }}>
                          {u.role === 'admin' ? '일반으로 변경' : '관리자로 변경'}
                        </button>
                      </form>
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="btn danger" type="submit" style={{ padding: '4px 10px' }}>
                          삭제
                        </button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
