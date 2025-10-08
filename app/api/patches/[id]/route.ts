import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { deleteImageKitFiles } from "@/lib/imagekit";

const patchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  sounds: z.array(z.string()).default([]),
  moduleIds: z.array(z.string()).default([]),
  schema: z.any().optional(),
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

    // Identify images that will be removed
    const imagesToDelete: string[] = [];
    
    // Check for removed patch images
    if (existingPatch.images && Array.isArray(existingPatch.images)) {
      const newImages = patchData.images || [];
      const removedImages = existingPatch.images.filter(img => !newImages.includes(img));
      imagesToDelete.push(...removedImages);
    }
    
    // Check for removed schema image
    if (existingPatch.schema && typeof existingPatch.schema === 'object') {
      const existingSchema = existingPatch.schema as any;
      const newSchema = patchData.schema;
      
      if (existingSchema.imageUrl && (!newSchema || newSchema.imageUrl !== existingSchema.imageUrl)) {
        imagesToDelete.push(existingSchema.imageUrl);
      }
    }

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

    // Delete removed images from ImageKit (fire-and-forget)
    if (imagesToDelete.length > 0) {
      deleteImageKitFiles(imagesToDelete).catch(error => {
        console.error('Failed to delete some ImageKit files during patch update:', params.id, error);
      });
    }

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

    // Collect all ImageKit URLs to delete
    const imagesToDelete: string[] = [];
    
    // Add patch images
    if (existingPatch.images && Array.isArray(existingPatch.images)) {
      imagesToDelete.push(...existingPatch.images);
      console.log(`🗑️ Found ${existingPatch.images.length} patch images to delete:`, existingPatch.images);
    }
    
    // Add schema image if it exists (patch schema might contain an imageUrl)
    if (existingPatch.schema && typeof existingPatch.schema === 'object') {
      const schema = existingPatch.schema as any;
      if (schema.imageUrl) {
        imagesToDelete.push(schema.imageUrl);
        console.log('🗑️ Found schema image to delete:', schema.imageUrl);
      }
    }

    console.log(`🗑️ Total images to delete for patch ${params.id}:`, imagesToDelete.length);

    // Delete the patch from database first
    await prisma.patch.delete({
      where: { id: params.id },
    });

    console.log(`✅ Patch ${params.id} deleted from database`);

    // Delete images from ImageKit (don't wait for completion, fire and forget)
    // This prevents delays in the API response
    if (imagesToDelete.length > 0) {
      console.log(`🚀 Starting ImageKit cleanup for ${imagesToDelete.length} images...`);
      deleteImageKitFiles(imagesToDelete).then(() => {
        console.log(`✅ ImageKit cleanup completed for patch ${params.id}`);
      }).catch(error => {
        console.error(`❌ Failed to delete some ImageKit files for patch ${params.id}:`, error);
      });
    } else {
      console.log(`ℹ️ No images to delete for patch ${params.id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patch:', error);
    return NextResponse.json(
      { error: "Failed to delete patch" },
      { status: 500 }
    );
  }
}

