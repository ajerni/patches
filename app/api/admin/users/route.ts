import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};
    
    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              patches: true,
              modules: true,
              patchLikes: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    
    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [publicPatches, privatePatches, recentActivity] = await Promise.all([
          prisma.patch.count({
            where: { userId: user.id, private: false }
          }),
          prisma.patch.count({
            where: { userId: user.id, private: true }
          }),
          prisma.patch.count({
            where: {
              userId: user.id,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          })
        ]);
        
        return {
          ...user,
          publicPatches,
          privatePatches,
          recentActivity
        };
      })
    );
    
    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
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
    
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return NextResponse.json({
      message: `User ${user.email} has been deleted successfully`
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
    
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
