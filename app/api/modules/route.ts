import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moduleSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  name: z.string().min(1, "Name is required"),
  types: z.array(z.string()).default([]),
  notes: z.string().optional(),
  images: z.array(z.string()).default([]),
});

// GET all modules for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const modules = await prisma.module.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        manufacturer: "asc",
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

// CREATE a new module
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
    const data = moduleSchema.parse(body);

    const module = await prisma.module.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}


