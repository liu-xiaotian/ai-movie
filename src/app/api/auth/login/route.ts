import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    // 1. 基础校验
    if (!email || !password) {
      return NextResponse.json(
        { error: "所有字段都是必填项" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少8位" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }
    //3. 密码对比
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    // 4. 登录成功（这里可以生成 session 或 JWT）
    // 例如：直接返回用户 id
    return NextResponse.json(
      { message: "登录成功", userId: user.id },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
