import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/pos',
  '/orders',
  '/kitchen',
  '/kitchen2',
  '/inventory',
  '/menu',
  '/categories',
  '/branches',
  '/profile',
  '/appearance',
  '/staff',
  '/settings',
  '/qr-codes',
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value;

  // Check if it is a protected route
  const isProtected = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      // Invalid token, remove cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Role-based authorization check (Managers can't access Admin-only pages)
    const adminOnlyRoutes = ['/branches', '/profile', '/appearance', '/staff', '/settings'];
    const isAdminOnly = adminOnlyRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isAdminOnly && payload.role !== 'admin') {
      // Redirect unauthorized roles to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  // Redirect logged-in users away from the login page
  if (pathname === '/login' && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
