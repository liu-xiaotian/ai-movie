"use client";
// app/(main)/layout.tsx
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MainLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.user) {
          router.replace("/login");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error("获取用户信息失败：", err);
        router.replace("/login");
      }
    };
    fetchUser();
  }, [router]);

  // 4. token 有效 → 渲染子页面
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FD]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </main>
      {modal}
    </div>
  );
}
