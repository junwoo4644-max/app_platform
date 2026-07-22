export { default } from 'next-auth/middleware';

// Protect everything except the login page, NextAuth's own API routes,
// uploaded thumbnails, and Next's static assets.
export const config = {
  matcher: ['/((?!login|api/auth|uploads|_next/static|_next/image|favicon.ico).*)'],
};
