"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { X } from "lucide-react";

type RouteDialogProps = {
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClassName?: string;
};

export default function RouteDialog({
  title,
  description,
  children,
  maxWidthClassName = "max-w-[920px]",
}: RouteDialogProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleClose = () => {
    router.back();
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/26 backdrop-blur-[4px]"
        onClick={handleClose}
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="route-dialog-title"
          className={clsx(
            "relative flex max-h-[calc(100vh-44px)] w-full flex-col overflow-hidden rounded-[30px] border border-indigo-100/90 bg-white shadow-[0_30px_80px_-26px_rgba(79,70,229,0.32)]",
            maxWidthClassName,
          )}
          onClick={stopPropagation}
        >
          <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-indigo-200/55 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-10 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400" />

          <div className="flex items-start justify-between gap-4 border-b border-indigo-100/80 bg-[linear-gradient(90deg,rgba(238,242,255,0.92),rgba(255,255,255,0.98))] px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Create Project
              </p>
              <h1
                id="route-dialog-title"
                className="mt-1.5 text-[28px] font-semibold tracking-tight text-slate-900"
              >
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="关闭弹框"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-indigo-500 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
