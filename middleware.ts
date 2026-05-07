import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isAdminRoute = createRouteMatcher([
  '/dashboard/settings(.*)', 
  '/dashboard/accounting(.*)', 
  '/dashboard/access(.*)'
]);
const isSuperadminRoute = createRouteMatcher(['/dashboard/system(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims as any)?.metadata?.role;

  // 1. If user is logged in and tries to access the home page, redirect to dashboard
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. Enforce route-based role protection
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Redirect Superadmin-only routes
    if (isSuperadminRoute(req) && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect Admin-only routes
    if (isAdminRoute(req) && role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect Clients away from staff pages
    const isStaffRoute = createRouteMatcher([
      '/dashboard/accounts(.*)', 
      '/dashboard/transactions(.*)', 
      '/dashboard/reports(.*)',
      '/dashboard/business(.*)',
      '/dashboard/ledgers(.*)'
    ]);
    if (isStaffRoute(req) && role === 'client') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

