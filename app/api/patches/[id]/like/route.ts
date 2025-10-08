import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Like a patch
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if patch exists and is public
    const patch = await prisma.patch.findUnique({
      where: { id: params.id },
      select: { id: true, private: true, userId: true }
    });

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (patch.private) {
      return NextResponse.json(
        { error: "Cannot like private patches" },
        { status: 403 }
      );
    }

    // Check if user already liked this patch
    const existingLike = await prisma.patchLike.findUnique({
      where: {
        patchId_userId: {
          patchId: params.id,
          userId: session.user.id
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Patch already liked" },
        { status: 400 }
      );
    }

    // Create the like
    await prisma.patchLike.create({
      data: {
        patchId: params.id,
        userId: session.user.id
      }
    });

    // Get updated like count
    const updatedPatch = await prisma.patch.findUnique({
      where: { id: params.id },
      select: { likeCount: true }
    });

    return NextResponse.json({
      success: true,
      likeCount: updatedPatch?.likeCount || 0,
      liked: true
    });

  } catch (error) {
    console.error("Error liking patch:", error);
    return NextResponse.json(
      { error: "Failed to like patch" },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a patch
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if patch exists and is public
    const patch = await prisma.patch.findUnique({
      where: { id: params.id },
      select: { id: true, private: true }
    });

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (patch.private) {
      return NextResponse.json(
        { error: "Cannot unlike private patches" },
        { status: 403 }
      );
    }

    // Delete the like
    const deletedLike = await prisma.patchLike.deleteMany({
      where: {
        patchId: params.id,
        userId: session.user.id
      }
    });

    if (deletedLike.count === 0) {
      return NextResponse.json(
        { error: "Patch not liked" },
        { status: 400 }
      );
    }

    // Get updated like count
    const updatedPatch = await prisma.patch.findUnique({
      where: { id: params.id },
      select: { likeCount: true }
    });

    return NextResponse.json({
      success: true,
      likeCount: updatedPatch?.likeCount || 0,
      liked: false
    });

  } catch (error) {
    console.error("Error unliking patch:", error);
    return NextResponse.json(
      { error: "Failed to unlike patch" },
      { status: 500 }
    );
  }
}

// GET - Check if user liked a patch and get like count
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if patch exists and is public
    const patch = await prisma.patch.findUnique({
      where: { id: params.id },
      select: { id: true, private: true, likeCount: true }
    });

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (patch.private) {
      return NextResponse.json(
        { error: "Cannot check like status for private patches" },
        { status: 403 }
      );
    }

    // Check if user liked this patch
    const userLike = await prisma.patchLike.findUnique({
      where: {
        patchId_userId: {
          patchId: params.id,
          userId: session.user.id
        }
      }
    });

    return NextResponse.json({
      likeCount: patch.likeCount,
      liked: !!userLike
    });

  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}
