"use client";

import React from "react";
import { Search, Zap, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F9FD]/80 backdrop-blur-md border-b border-slate-100 px-10 py-4">
      <div className="flex items-center justify-between relative">
        {/* 左侧空位 (或者放面包屑/返回键) */}
        <div className="w-40 flex-shrink-0">
          {/* 这里可以留空，保持三明治布局平衡 */}
        </div>

        {/* --- 中间搜索框 --- */}
        <div className="flex-1 max-w-md mx-auto relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索项目"
            className={clsx(
              "w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4",
              "text-sm outline-none shadow-sm transition-all",
              "focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500",
            )}
          />
        </div>

        {/* --- 右侧用户选项 --- */}
        <div className="w-40 flex items-center justify-end gap-6 text-slate-500 flex-shrink-0">
          <Link href="/account">
            <div className="flex items-center gap-2 cursor-pointer group px-2 py-1 hover:bg-white rounded-xl transition-all">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                账户
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
