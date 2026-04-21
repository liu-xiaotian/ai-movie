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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
          <Zap size={20} fill="currentColor" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">ai movie</h1>
          <p className="text-xs text-slate-400">版本 0.0.1</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-white shadow-sm border border-slate-100 text-indigo-600 font-bold"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-4">
        {/* <Link href="/projects/new">
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mb-4">
            新建项目
          </button>
        </Link> */}
        {/* <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 w-full p-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            <Settings size={18} /> 设置
          </Link>
        </div> */}
      </div>
    </aside>
  );
}
