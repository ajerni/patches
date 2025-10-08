import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { deleteImageKitFiles } from "@/lib/imagekit";

const moduleSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).default([]),
});

// GET a single module
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

    const module = await prisma.module.findUnique({
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
            patch: {
              select: {
                id: true,
                title: true,
                description: true,
                tags: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    if (module.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(module);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// UPDATE a module
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

    const existingModule = await prisma.module.findUnique({
      where: { id: params.id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    if (existingModule.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = moduleSchema.parse(body);

    // Identify images that will be removed
    const imagesToDelete: string[] = [];
    
    // Check for removed module images
    if (existingModule.images && Array.isArray(existingModule.images)) {
      const newImages = data.images || [];
      const removedImages = existingModule.images.filter(img => !newImages.includes(img));
      imagesToDelete.push(...removedImages);
    }

    const module = await prisma.module.update({
      where: { id: params.id },
      data,
    });

    // Delete removed images from ImageKit (fire-and-forget)
    if (imagesToDelete.length > 0) {
      deleteImageKitFiles(imagesToDelete).catch(error => {
        console.error('Failed to delete some ImageKit files during module update:', params.id, error);
      });
    }

    return NextResponse.json(module);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// DELETE a module
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

    const existingModule = await prisma.module.findUnique({
      where: { id: params.id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    if (existingModule.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Collect all ImageKit URLs to delete
    const imagesToDelete: string[] = [];
    
    // Add module images
    if (existingModule.images && Array.isArray(existingModule.images)) {
      imagesToDelete.push(...existingModule.images);
    }

    // Delete the module from database first
    await prisma.module.delete({
      where: { id: params.id },
    });

    // Delete images from ImageKit (don't wait for completion, fire and forget)
    // This prevents delays in the API response
    if (imagesToDelete.length > 0) {
      deleteImageKitFiles(imagesToDelete).catch(error => {
        console.error('Failed to delete some ImageKit files for module:', params.id, error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}


