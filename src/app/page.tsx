"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MovieDashboardClient from "./(main)/dashboard/MovieDashboardClient";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => ({
        ok: res.ok,
        data: await res.json(),
      }))
      .then(({ ok, data }) => {
        if (!ok || !data.user) {
          router.replace("/login");
        } else {
          setUser(data.user);
        }
      });
  }, [router]);

  if (!user) return <div>正在跳转到登录...</div>;

  // token 验证通过 → 渲染客户端组件
  return <MovieDashboardClient />;
}
