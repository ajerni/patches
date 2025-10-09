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
    const manufacturer = searchParams.get('manufacturer') || '';
    const type = searchParams.get('type') || '';
    const userId = searchParams.get('userId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { manufacturer: { contains: search, mode: 'insensitive' as const } },
        { types: { has: search } },
        { notes: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } }
      ];
    }
    
    // Manufacturer filter
    if (manufacturer) {
      where.manufacturer = { contains: manufacturer, mode: 'insensitive' as const };
    }
    
    // Type filter
    if (type) {
      where.types = { has: type };
    }
    
    // User filter
    if (userId) {
      where.userId = userId;
    }
    
    // Get modules with pagination
    const [modules, totalCount] = await Promise.all([
      prisma.module.findMany({
        where,
        select: {
          id: true,
          manufacturer: true,
          name: true,
          types: true,
          notes: true,
          images: true,
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
              patchModules: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.module.count({ where })
    ]);
    
    // Calculate additional stats for each module
    const modulesWithStats = await Promise.all(
      modules.map(async (module) => {
        const [recentUsage, uniquePatches] = await Promise.all([
          prisma.patchModule.count({
            where: {
              moduleId: module.id,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          }),
          prisma.patchModule.findMany({
            where: { moduleId: module.id },
            select: { patchId: true },
            distinct: ['patchId']
          })
        ]);
        
        return {
          ...module,
          recentUsage,
          uniquePatches: uniquePatches.length,
          // Truncate long notes for table view
          notesPreview: module.notes && module.notes.length > 100 
            ? module.notes.substring(0, 100) + '...' 
            : module.notes
        };
      })
    );
    
    // Get unique manufacturers and types for filters
    const [manufacturers, types] = await Promise.all([
      prisma.module.findMany({
        select: { manufacturer: true },
        distinct: ['manufacturer'],
        orderBy: { manufacturer: 'asc' }
      }),
      prisma.module.findMany({
        select: { types: true }
      })
    ]);
    
    // Flatten and deduplicate types
    const allTypes = Array.from(new Set(
      types.flatMap(m => m.types)
    )).sort();
    
    return NextResponse.json({
      modules: modulesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        manufacturers: manufacturers.map(m => m.manufacturer),
        types: allTypes
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
    
    console.error('Admin modules error:', error);
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
    const moduleId = searchParams.get('moduleId');
    
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }
    
    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { 
        id: true, 
        name: true, 
        manufacturer: true,
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    // Delete module (cascade will handle related data)
    await prisma.module.delete({
      where: { id: moduleId }
    });
    
    return NextResponse.json({
      message: `Module "${module.manufacturer} ${module.name}" by ${module.user.name} has been deleted successfully`
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
    
    console.error('Admin delete module error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
