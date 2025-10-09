import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow the specific public patch without authentication
  if (pathname === "/patches/cmgj5m2vo0007109dy80vryyu") {
    return NextResponse.next();
  }
  
  // For all other protected routes, redirect to login if not authenticated
  // This will be handled by the page components themselves
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/patches/:path*", 
    "/modules/:path*"
  ],
};

