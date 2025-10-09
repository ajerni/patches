import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminMiddleware } from "./lib/admin-middleware";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow the specific public patch without authentication
  if (pathname === "/patches/cmgj5m2vo0007109dy80vryyu") {
    return NextResponse.next();
  }
  
  // Handle admin routes with admin middleware
  if (pathname.startsWith("/admin")) {
    return adminMiddleware(request);
  }
  
  // For all other protected routes, redirect to login if not authenticated
  // This will be handled by the page components themselves
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/patches/:path*", 
    "/modules/:path*",
    "/admin/:path*"
  ],
};

