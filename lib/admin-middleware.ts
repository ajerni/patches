import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to protect admin routes
 * Checks if user is authenticated and has admin privileges
 */
export async function adminMiddleware(request: NextRequest) {
  // Get the JWT token from the request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Check if user is authenticated
  if (!token?.email) {
    return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(request.url), request.url));
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  
  if (!adminEmails.includes(token.email)) {
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
  }

  // User is authenticated and is admin, allow access
  return NextResponse.next();
}
