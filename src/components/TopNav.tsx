"use client";

import React from "react";
import { Search, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[color:var(--border-strong)] bg-[var(--surface-soft)] px-10 py-4 backdrop-blur-md transition-colors">
      <div className="relative flex items-center justify-between">
        <div className="w-40 flex-shrink-0" />

        <div className="group relative mx-auto max-w-md flex-1">
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-brand"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索项目"
            className={clsx(
              "w-full rounded-2xl border border-[color:var(--border-strong)] bg-[var(--surface-strong)] py-2.5 pr-4 pl-12",
              "text-sm text-[var(--text-strong)] shadow-sm outline-none transition-all placeholder:text-[var(--text-muted)]",
              "focus:border-brand focus:ring-4 focus:ring-brand/10",
            )}
          />
        </div>

        <div className="w-40 flex-shrink-0 flex items-center justify-end gap-6 text-[var(--text-medium)]">
          <Link href="/account">
            <div className="group flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 transition-all hover:bg-[var(--surface-strong)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--text-strong)] transition-colors group-hover:text-brand">
                账户
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
