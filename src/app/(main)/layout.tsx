"use client";

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
      } catch (error) {
        console.error("获取用户信息失败", error);
        router.replace("/login");
      }
    };

    fetchUser().catch(() => {});
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-strong)] transition-colors">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {modal}
    </div>
  );
}
