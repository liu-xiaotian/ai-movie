import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "@/lib/subtitle-parser";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

async function getUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const id = Number(projectId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["srt", "vtt", "ass"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: "仅支持 .srt、.vtt、.ass 格式" },
        { status: 400 },
      );
    }

    // Read and parse the subtitle file
    const content = await file.text();
    const parsed = parse(file.name, content);

    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "字幕文件解析失败，请检查格式" },
        { status: 400 },
      );
    }

    // Store file metadata and subtitle entries in a transaction
    const storageKey = `uploads/${id}/${Date.now()}_${file.name}`;

    await prisma.$transaction([
      // Remove old subtitle entries (re-upload scenario)
      prisma.subtitleEntry.deleteMany({ where: { projectId: id } }),

      // Create ProjectFile record
      prisma.projectFile.create({
        data: {
          projectId: id,
          originalName: file.name,
          storageKey,
          fileUrl: `/${storageKey}`,
          extension: ext,
          size: file.size,
          fileType: "SUBTITLE",
        },
      }),

      // Bulk insert subtitle entries
      prisma.subtitleEntry.createMany({
        data: parsed.map((e) => ({
          projectId: id,
          index: e.index,
          startTime: e.startTime,
          endTime: e.endTime,
          original: e.text,
        })),
        skipDuplicates: true,
      }),

      // Update project status
      prisma.project.update({
        where: { id },
        data: { status: "IN_PROGRESS", progress: 50, currentStep: 2 },
      }),
    ]);

    return NextResponse.json({ count: parsed.length });
  } catch (error) {
    console.error("POST /api/projects/[projectId]/upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
