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
    const visibility = searchParams.get('visibility') || 'all'; // all, public, private
    const userId = searchParams.get('userId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { tags: { has: search } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } }
      ];
    }
    
    // Visibility filter
    if (visibility === 'public') {
      where.private = false;
    } else if (visibility === 'private') {
      where.private = true;
    }
    
    // User filter
    if (userId) {
      where.userId = userId;
    }
    
    // Get patches with pagination
    const [patches, totalCount] = await Promise.all([
      prisma.patch.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          instructions: true,
          notes: true,
          tags: true,
          images: true,
          sounds: true,
          private: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              patchModules: true,
              likes: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.patch.count({ where })
    ]);
    
    // Calculate additional stats for each patch
    const patchesWithStats = await Promise.all(
      patches.map(async (patch) => {
        const [recentLikes, hasSchema] = await Promise.all([
          prisma.patchLike.count({
            where: {
              patchId: patch.id,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          }),
          patch.schema ? true : false
        ]);
        
        return {
          ...patch,
          recentLikes,
          hasSchema,
          // Truncate long descriptions for table view
          descriptionPreview: patch.description.length > 100 
            ? patch.description.substring(0, 100) + '...' 
            : patch.description
        };
      })
    );
    
    return NextResponse.json({
      patches: patchesWithStats,
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
    
    console.error('Admin patches error:', error);
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
    const patchId = searchParams.get('patchId');
    
    if (!patchId) {
      return NextResponse.json(
        { error: 'Patch ID is required' },
        { status: 400 }
      );
    }
    
    // Check if patch exists
    const patch = await prisma.patch.findUnique({
      where: { id: patchId },
      select: { 
        id: true, 
        title: true, 
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!patch) {
      return NextResponse.json(
        { error: 'Patch not found' },
        { status: 404 }
      );
    }
    
    // Delete patch (cascade will handle related data)
    await prisma.patch.delete({
      where: { id: patchId }
    });
    
    return NextResponse.json({
      message: `Patch "${patch.title}" by ${patch.user.name} has been deleted successfully`
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
    
    console.error('Admin delete patch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const { patchId, private: isPrivate } = await request.json();
    
    if (!patchId) {
      return NextResponse.json(
        { error: 'Patch ID is required' },
        { status: 400 }
      );
    }
    
    // Check if patch exists
    const patch = await prisma.patch.findUnique({
      where: { id: patchId },
      select: { id: true, title: true, private: true }
    });
    
    if (!patch) {
      return NextResponse.json(
        { error: 'Patch not found' },
        { status: 404 }
      );
    }
    
    // Update patch visibility
    const updatedPatch = await prisma.patch.update({
      where: { id: patchId },
      data: { private: isPrivate },
      select: { id: true, title: true, private: true }
    });
    
    return NextResponse.json({
      message: `Patch "${updatedPatch.title}" visibility updated to ${isPrivate ? 'private' : 'public'}`,
      patch: updatedPatch
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
    
    console.error('Admin update patch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
