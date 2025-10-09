import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
