import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminStats, getRecentPatches, getRecentModules } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    // Get admin statistics and recent data
    const [stats, recentPatches, recentModules] = await Promise.all([
      getAdminStats(),
      getRecentPatches(5),
      getRecentModules(5)
    ]);
    
    return NextResponse.json({
      ...stats,
      recentPatches,
      recentModules
    });
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
    
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
