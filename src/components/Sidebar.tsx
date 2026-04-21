"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Folder, Zap, HelpCircle, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "电影推荐", icon: <Search size={18} />, href: "/dashboard" },
    { name: "项目", icon: <Folder size={18} />, href: "/projects" },
    { name: "账户", icon: <HelpCircle size={18} />, href: "/account" },
    { name: "设置", icon: <Settings size={18} />, href: "/settings" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border-strong)] bg-[var(--surface-strong)] p-6 transition-colors">
      <div className="mb-10 flex items-center gap-2">
        <div className="rounded-lg bg-brand p-1.5 text-white">
          <Zap size={20} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-[var(--text-strong)]">
            ai movie
          </h1>
          <p className="text-xs text-[var(--text-muted)]">版本 0.0.1</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                isActive
                  ? "border border-[color:var(--border-strong)] bg-[var(--surface-soft)] font-bold text-brand shadow-sm"
                  : "text-[var(--text-medium)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4" />
    </aside>
  );
}
