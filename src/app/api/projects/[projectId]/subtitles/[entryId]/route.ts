import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ projectId: string; entryId: string }>;
};

async function getUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, entryId } = await context.params;
  const pid = Number(projectId);
  const eid = Number(entryId);
  if (isNaN(pid) || isNaN(eid)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Verify project ownership
  const project = await prisma.project.findUnique({ where: { id: pid } });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { translation } = await req.json();

  const updated = await prisma.subtitleEntry.update({
    where: { id: eid },
    data: { translation },
  });

  return NextResponse.json(updated);
}
