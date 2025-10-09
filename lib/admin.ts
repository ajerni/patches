import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Check if the current user is an admin based on their email
 * Admin emails are defined in the ADMIN_EMAILS environment variable (comma-separated)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  
  return adminEmails.includes(session.user.email);
}

/**
 * Get the current user's session and check if they're an admin
 * Returns null if not authenticated, user data if authenticated, and throws error if not admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  
  if (!adminEmails.includes(session.user.email)) {
    throw new Error('Admin access required');
  }

  return session.user;
}

/**
 * Get admin statistics for the dashboard
 */
export async function getAdminStats() {
  const { prisma } = await import('./prisma');
  
  const [
    totalUsers,
    totalPatches,
    totalModules,
    recentUsers,
    recentPatches,
    publicPatches,
    privatePatches,
    totalLikes,
    recentModules
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patch.count(),
    prisma.module.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    }),
    prisma.patch.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    }),
    prisma.patch.count({
      where: { private: false }
    }),
    prisma.patch.count({
      where: { private: true }
    }),
    prisma.patchLike.count(),
    prisma.module.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })
  ]);

  return {
    totalUsers,
    totalPatches,
    totalModules,
    recentUsers,
    recentPatchesCount: recentPatches,
    recentModulesCount: recentModules,
    publicPatches,
    privatePatches,
    totalLikes,
    averageLikesPerPatch: totalPatches > 0 ? Math.round(totalLikes / totalPatches * 10) / 10 : 0
  };
}

/**
 * Get recent patches for admin dashboard (including private ones)
 */
export async function getRecentPatches(limit: number = 5) {
  const { prisma } = await import('./prisma');
  
  return await prisma.patch.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      private: true,
      createdAt: true,
      likeCount: true,
      user: {
        select: {
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
    }
  });
}

/**
 * Get recent modules for admin dashboard
 */
export async function getRecentModules(limit: number = 5) {
  const { prisma } = await import('./prisma');
  
  return await prisma.module.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      manufacturer: true,
      types: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          patchModules: true
        }
      }
    }
  });
}
