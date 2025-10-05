import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  sounds: z.array(z.string()).default([]),
  moduleIds: z.array(z.string()).default([]),
});

// GET a single patch
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

    const patch = await prisma.patch.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        patchModules: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (patch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(patch);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patch" },
      { status: 500 }
    );
  }
}

// UPDATE a patch
export async function PUT(
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

    const existingPatch = await prisma.patch.findUnique({
      where: { id: params.id },
    });

    if (!existingPatch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (existingPatch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { moduleIds, ...patchData } = patchSchema.parse(body);

    // Update patch with optional module relationships
    const patchUpdateData: any = {
      ...patchData,
    };

    // Handle module relationships
    if (moduleIds !== undefined) {
      patchUpdateData.patchModules = {
        // Delete all existing relationships
        deleteMany: {},
      };
      
      // Only create new relationships if there are moduleIds
      if (moduleIds.length > 0) {
        patchUpdateData.patchModules.create = moduleIds.map((moduleId) => ({
          moduleId,
        }));
      }
    }

    const patch = await prisma.patch.update({
      where: { id: params.id },
      data: patchUpdateData,
      include: {
        patchModules: {
          include: {
            module: true,
          },
        },
      },
    });

    return NextResponse.json(patch);
  } catch (error) {
    console.error("Error updating patch:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to update patch",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE a patch
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

    const existingPatch = await prisma.patch.findUnique({
      where: { id: params.id },
    });

    if (!existingPatch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    if (existingPatch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.patch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete patch" },
      { status: 500 }
    );
  }
}

