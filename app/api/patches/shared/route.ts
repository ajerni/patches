import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SharedPatchesQuery {
  search?: string;
  sortBy?: 'date' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// GET all public patches with search and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'date' | 'alphabetical') || 'date';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor') || undefined; // For cursor-based pagination
    
    // Calculate offset for pagination (fallback for page-based)
    const offset = (page - 1) * limit;
    
    // Build where clause for public patches
    const whereClause: any = {
      private: false, // Only public patches
    };
    
    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            has: search,
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          patchModules: {
            some: {
              module: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    manufacturer: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        },
      ];
    }
    
    // Build orderBy clause
    let orderBy: any = {};
    if (sortBy === 'date') {
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === 'alphabetical') {
      orderBy.title = sortOrder;
    }
    
    // For tag partial matching, we need to use raw SQL
    let patches: any[] = [];
    let totalCount = 0;

    if (search) {
      try {
        // Use raw SQL for comprehensive tag search including partial matches
        const searchPattern = `%${search}%`;
        
        const orderByField = sortBy === 'alphabetical' ? 'p.title' : 'p."updatedAt"';
        const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
        
        // Build cursor condition for better performance with large datasets
        let cursorCondition = '';
        if (cursor) {
          if (sortBy === 'alphabetical') {
            const comparison = sortOrder === 'desc' ? '<' : '>';
            cursorCondition = `AND p.title ${comparison} '${cursor}'`;
          } else {
            const comparison = sortOrder === 'desc' ? '<' : '>';
            cursorCondition = `AND p."updatedAt" ${comparison} '${cursor}'`;
          }
        }
        
        const rawPatches = await prisma.$queryRaw`
          SELECT DISTINCT p.*, u.name as user_name, u.id as user_id
          FROM patches_patches p
          JOIN patches_users u ON p."userId" = u.id
          WHERE p.private = false
          AND (
            LOWER(p.title) LIKE LOWER(${searchPattern})
            OR LOWER(p.description) LIKE LOWER(${searchPattern})
            OR LOWER(u.name) LIKE LOWER(${searchPattern})
            OR EXISTS (
              SELECT 1 FROM unnest(p.tags) AS tag
              WHERE LOWER(tag) LIKE LOWER(${searchPattern})
            )
            OR EXISTS (
              SELECT 1 FROM patch_modules pm
              JOIN modules m ON pm."moduleId" = m.id
              WHERE pm."patchId" = p.id
              AND (
                LOWER(m.name) LIKE LOWER(${searchPattern})
                OR LOWER(m.manufacturer) LIKE LOWER(${searchPattern})
              )
            )
          )
          ${cursorCondition}
          ORDER BY ${orderByField} ${orderDirection}
          LIMIT ${limit}
        `;

      const rawCount = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT p.id) as count
        FROM patches_patches p
        JOIN patches_users u ON p."userId" = u.id
        WHERE p.private = false
        AND (
          LOWER(p.title) LIKE LOWER(${searchPattern})
          OR LOWER(p.description) LIKE LOWER(${searchPattern})
          OR LOWER(u.name) LIKE LOWER(${searchPattern})
          OR EXISTS (
            SELECT 1 FROM unnest(p.tags) AS tag
            WHERE LOWER(tag) LIKE LOWER(${searchPattern})
          )
          OR EXISTS (
            SELECT 1 FROM patch_modules pm
            JOIN modules m ON pm."moduleId" = m.id
            WHERE pm."patchId" = p.id
            AND (
              LOWER(m.name) LIKE LOWER(${searchPattern})
              OR LOWER(m.manufacturer) LIKE LOWER(${searchPattern})
            )
          )
        )
      `;

      // Fetch module information for the raw SQL results
      const patchIds = (rawPatches as any[]).map(p => p.id);
      const modulesData = await prisma.patchModule.findMany({
        where: {
          patchId: {
            in: patchIds,
          },
        },
        include: {
          module: {
            select: {
              id: true,
              name: true,
              manufacturer: true,
            },
          },
        },
      });

      // Group modules by patch ID
      const modulesByPatchId = modulesData.reduce((acc, pm) => {
        if (!acc[pm.patchId]) {
          acc[pm.patchId] = [];
        }
        acc[pm.patchId].push(pm);
        return acc;
      }, {} as any);

      // Add module data to patches
      patches = (rawPatches as any[]).map(patch => ({
        ...patch,
        patchModules: modulesByPatchId[patch.id] || [],
      }));
      
        totalCount = Number((rawCount as any)[0].count);
      } catch (error) {
        console.error('Error in raw SQL search:', error);
        // Fallback to regular Prisma search if raw SQL fails
        const [prismaPatches, prismaCount] = await Promise.all([
          prisma.patch.findMany({
            where: whereClause,
            orderBy,
            skip: offset,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              patchModules: {
                include: {
                  module: {
                    select: {
                      id: true,
                      name: true,
                      manufacturer: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.patch.count({
            where: whereClause,
          }),
        ]);
        
        patches = prismaPatches;
        totalCount = prismaCount;
      }
    } else {
      // Use regular Prisma query when no search
      const [prismaPatches, prismaCount] = await Promise.all([
        prisma.patch.findMany({
          where: whereClause,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            patchModules: {
              include: {
                module: {
                  select: {
                    id: true,
                    name: true,
                    manufacturer: true,
                  },
                },
              },
            },
          },
        }),
        prisma.patch.count({
          where: whereClause,
        }),
      ]);
      
      patches = prismaPatches;
      totalCount = prismaCount;
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    // Transform the data for the frontend
    const transformedPatches = patches.map((patch: any) => {
      // Handle both raw SQL results and Prisma results
      const user = patch.user || { id: patch.user_id, name: patch.user_name };
      const patchModules = patch.patchModules || [];
      
      return {
        id: patch.id,
        title: patch.title,
        description: patch.description,
        tags: patch.tags,
        images: patch.images,
        sounds: patch.sounds,
        private: patch.private,
        createdAt: patch.createdAt,
        updatedAt: patch.updatedAt,
        user: user,
        moduleCount: patchModules.length,
        modules: patchModules.map((pm: any) => pm.module),
      };
    });
    
    // Calculate next cursor for cursor-based pagination
    let nextCursor = null;
    if (patches.length === limit && patches.length > 0) {
      const lastPatch = patches[patches.length - 1];
      if (sortBy === 'alphabetical') {
        nextCursor = lastPatch.title;
      } else {
        nextCursor = lastPatch.updatedAt.toISOString();
      }
    }
    
    return NextResponse.json({
      patches: transformedPatches,
      pagination: {
        page,
        limit,
        total: totalCount, // Changed from totalCount to total
        hasMore,
        nextCursor, // Add cursor for next page
      },
    });
  } catch (error) {
    console.error("Error fetching shared patches:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared patches" },
      { status: 500 }
    );
  }
}
