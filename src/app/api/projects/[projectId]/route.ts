import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

async function getUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const id = Number(projectId);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, progress, currentStep } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress }),
        ...(currentStep !== undefined && { currentStep }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const id = Number(projectId);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.subtitleEntry.deleteMany({ where: { projectId: id } }),
      prisma.projectFile.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    revalidatePath("/projects");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[projectId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
