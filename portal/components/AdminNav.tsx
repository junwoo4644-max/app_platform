import Link from 'next/link';

export default function AdminNav({ active }: { active: 'apps' | 'users' }) {
  return (
    <div className="admin-nav">
      <Link href="/admin" className={active === 'apps' ? 'active' : ''}>
        앱 관리
      </Link>
      <Link href="/admin/users" className={active === 'users' ? 'active' : ''}>
        가입자 관리
      </Link>
    </div>
  );
}
