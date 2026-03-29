"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.user) {
          router.replace("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("获取用户信息失败：", err);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);
  return (
    <html lang="zh">
      <body className="flex items-center justify-center min-h-screen bg-bgLight">
        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
