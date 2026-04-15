"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash, Clock, Loader2 } from "lucide-react";

type ProjectItemProps = {
  id: number;
  title: string;
  time: string;
  status: string;
  progress: number;
  isDone: boolean;
};

type DeleteProjectResponse = {
  error?: string;
};

function getDeleteErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const error = data.error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return "删除项目失败，请稍后重试";
}

export default function ProjectItem({
  id,
  title,
  time,
  status,
  progress,
  isDone,
}: ProjectItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      title.trim()
        ? `确定删除“${title}”项目吗？此操作不可撤销。`
        : "确定删除这个项目吗？此操作不可撤销。",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      const data = (await response
        .json()
        .catch(() => null)) as DeleteProjectResponse | null;

      if (!response.ok) {
        throw new Error(getDeleteErrorMessage(data));
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setIsDeleting(false);
      window.alert(
        error instanceof Error ? error.message : "删除项目失败，请稍后重试",
      );
    }
  };

  return (
    <div
      className={`relative bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-6 transition-all group ${
        isDeleting
          ? "opacity-70 shadow-sm shadow-slate-200/50"
          : "hover:shadow-md hover:shadow-slate-200/50"
      }`}
    >
      <Link
        href={`/projects/${id}`}
        aria-label={`打开项目 ${title}`}
        className={`absolute inset-0 rounded-3xl ${
          isDeleting ? "pointer-events-none" : ""
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30`}
      />

      <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
        <span className="text-slate-300 text-3xl font-bold">
          {title.charAt(0)}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between h-20 py-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="font-bold text-lg text-slate-800 truncate">
              {title}
            </h4>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock size={14} /> {time}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full ${
                  isDone
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`删除项目 ${title}`}
            title="删除项目"
            className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash size={20} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 min-w-[30px]">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
