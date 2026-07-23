import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Home page (app store grid) is public -- only app detail pages (where the
// actual download/open action lives) and the admin area require a session.
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token as { role?: string } | null)?.role;
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/apps/:path*'],
};
