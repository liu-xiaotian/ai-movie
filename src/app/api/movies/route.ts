import { NextResponse } from "next/server";
import movieData from "@/data/movies.json"; // 导入本地数据

export async function GET() {
  // 可以在这里模拟 500ms 的延迟，测试前端的 Loading 效果
  // await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(movieData);
}
