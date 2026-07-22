'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function TopBar({ email, isAdminPage }: { email?: string | null; isAdminPage?: boolean }) {
  return (
    <div className="topbar">
      <h1>My Apps</h1>
      <div className="links">
        {email && <span>{email}</span>}
        {isAdminPage ? <Link href="/">앱 목록</Link> : <Link href="/admin">앱 관리</Link>}
        <button onClick={() => signOut({ callbackUrl: '/login' })}>로그아웃</button>
      </div>
    </div>
  );
}
