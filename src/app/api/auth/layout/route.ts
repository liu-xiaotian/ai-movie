import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
  // 设置同名 cookie， 过期时间为 0
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  const res = NextResponse.json({ message: "以退出登录" }, { status: 200 });
  res.headers.append("Set Cookie", cookie);
  return res;
}
