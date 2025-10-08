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
  schema: z.any().optional(),
  private: z.boolean().default(true),
});

// GET all patches for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const patches = await prisma.patch.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(patches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patches" },
      { status: 500 }
    );
  }
}

// CREATE a new patch
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("=== CREATE PATCH REQUEST ===");
    console.log("Raw body:", JSON.stringify(body, null, 2));
    
    const { moduleIds, ...patchData } = patchSchema.parse(body);
    console.log("Parsed moduleIds:", moduleIds);
    console.log("Parsed patchData:", JSON.stringify(patchData, null, 2));

    // Create patch with optional module relationships
    const patchCreateData: any = {
      ...patchData,
      userId: session.user.id,
    };
    console.log("patchCreateData before modules:", JSON.stringify(patchCreateData, null, 2));

    // Only include patchModules if there are moduleIds
    if (moduleIds && moduleIds.length > 0) {
      console.log("Adding patchModules to create data");
      patchCreateData.patchModules = {
        create: moduleIds.map((moduleId) => ({
          moduleId,
        })),
      };
    } else {
      console.log("No moduleIds, skipping patchModules");
    }

    console.log("Final patchCreateData:", JSON.stringify(patchCreateData, null, 2));
    console.log("About to call prisma.patch.create...");

    const patch = await prisma.patch.create({
      data: patchCreateData,
      include: {
        patchModules: {
          include: {
            module: true,
          },
        },
      },
    });

    console.log("✅ Patch created successfully:", patch.id);

    return NextResponse.json(patch, { status: 201 });
  } catch (error) {
    console.error("Error creating patch:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create patch",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

