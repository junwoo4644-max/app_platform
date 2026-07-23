'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function TopBar({
  email,
  role,
  isAdminPage,
}: {
  email?: string | null;
  role?: string | null;
  isAdminPage?: boolean;
}) {
  return (
    <div className="topbar">
      <Link href="/" className="topbar-brand">
        VHS LAB APPS
      </Link>
      <div className="links">
        {email ? (
          <>
            <span className="topbar-email">{email}</span>
            {role === 'admin' &&
              (isAdminPage ? <Link href="/">앱 목록</Link> : <Link href="/admin">관리자</Link>)}
            <button onClick={() => signOut({ callbackUrl: '/' })}>로그아웃</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn secondary topbar-login">
              로그인
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
