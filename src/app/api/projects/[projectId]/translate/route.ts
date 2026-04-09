import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

const BIGMODEL_URL =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const SYSTEM_PROMPT =
  "你是一名专业的影视字幕翻译员。将用户提供的字幕原文翻译成简体中文，要求：语言自然流畅，符合影视字幕风格，保持原有语气和情感，只返回翻译结果，不需要任何解释或额外内容。";

async function getUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      { error: "BIGMODEL_API_KEY 未配置，请在 .env 中填写" },
      { status: 503 },
    );
  }

  const { projectId } = await context.params;
  const pid = Number(projectId);
  if (isNaN(pid)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: pid } });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { entryId } = await req.json();

  const entry = await prisma.subtitleEntry.findFirst({
    where: { id: Number(entryId), projectId: pid },
  });
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  // Call BigModel with streaming
  const upstream = await fetch(BIGMODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: entry.original },
      ],
      stream: true,
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    console.error("BigModel error:", err);
    return NextResponse.json(
      { error: "翻译服务暂时不可用，请稍后重试" },
      { status: 502 },
    );
  }

  // Proxy the SSE stream directly back to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
