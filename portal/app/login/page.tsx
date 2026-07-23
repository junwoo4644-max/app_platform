'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? '가입에 실패했습니다.');
        }
      }

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-title">My Apps</div>
      <div className="auth-subtitle">{mode === 'login' ? '로그인하고 앱을 이용하세요' : '계정을 만들고 시작하세요'}</div>
      <form onSubmit={handleSubmit} className="form">
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder={mode === 'signup' ? '비밀번호 (8자 이상)' : '비밀번호'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === 'signup' ? 8 : undefined}
        />
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {mode === 'login' ? '로그인' : '가입하고 시작하기'}
        </button>
      </form>
      <button className="btn secondary" style={{ marginTop: 12 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? '계정이 없다면 가입하기' : '이미 계정이 있다면 로그인'}
      </button>
      <a className="auth-back" href="/">
        ← 앱 목록으로
      </a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
