import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 你的 prisma 客户端
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // 1. 基础校验
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "所有字段都是必填项" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "密码至少8位" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "两次密码不一致" }, { status: 400 });
    }

    if (name.length < 2 || name.length > 20) {
      return NextResponse.json(
        { error: "用户名长度2~20字符" },
        { status: 400 },
      );
    }

    // 2. 检查邮箱是否存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 400 });
    }

    // 3. 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 写入数据库
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
