import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth"; // ⚠️ 注意：v5 建议从你定义 auth 的地方导出 auth
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  console.log(session);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: Number(session.user.id) },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  console.log("SESSION:", session);
  ``;
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized /api/projects/route.ts" },
      { status: 401 },
    );
  }

  const { title, description } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId: Number(session.user.id),
      title,
      description,
      status: "DRAFT",
      progress: 0,
      currentStep: 1,
    },
  });

  return NextResponse.json(project);
}
