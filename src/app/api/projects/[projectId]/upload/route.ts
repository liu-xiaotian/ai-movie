import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth"; // 适配 v5/Auth.js

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    // 1. 使用 v5 的 auth() 获取 session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 等待并解析 params
    const { projectId } = await context.params;
    const id = Number(projectId);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid project id" },
        { status: 400 },
      );
    }

    // 3. 获取并校验 Body 数据
    const body = await req.json();
    const { status, progress, currentStep } = body;

    // 4. 确认项目存在且属于当前用户
    const project = await prisma.project.findUnique({
      where: { id },
    });

    // 注意：session.user.id 在 v5 中通常是 string，需要与数据库类型匹配（如果你数据库是 Int）
    if (!project || project.userId !== Number(session.user.id)) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 },
      );
    }

    // 5. 执行更新
    // 使用解构赋值的技巧，只在 body 中存在对应字段时才更新
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
