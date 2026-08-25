import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session')?.value;
  const { pathname } = request.nextUrl;

  // Если пользователь заходит на /admin (кроме /admin/login) и значение куки не 'authenticated'
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (adminSession !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Если пользователь УЖЕ авторизован и пытается зайти на /admin/login — редиректим в админку
  if (pathname === '/admin/login' && adminSession === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};