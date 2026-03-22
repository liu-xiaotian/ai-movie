import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "ai movie - AI 字幕",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-[#F8F9FD]">
          {/* 全局侧边栏 */}
          <Sidebar />

          {/* 右侧主内容区 */}
          <main className="flex-1 flex flex-col  h-screen overflow-y-hidden">
            {/* 顶部固定导航栏 */}
            <TopNav />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </main>
        </div>
      </body>
    </html>
  );
}
