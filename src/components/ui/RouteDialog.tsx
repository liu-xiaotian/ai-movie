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
  maxWidthClassName = "max-w-5xl",
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 py-6 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-dialog-title"
        className={clsx(
          "flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_-24px_rgba(15,23,42,0.45)]",
          maxWidthClassName,
        )}
        onClick={stopPropagation}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
          <div>
            <h1
              id="route-dialog-title"
              className="text-3xl font-semibold tracking-tight text-slate-900"
            >
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm leading-7 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="关闭弹框"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
