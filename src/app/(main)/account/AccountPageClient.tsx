"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Film,
  LogOut,
  Mail,
  Plus,
  ShieldCheck,
  Subtitles,
  UserCircle2,
  Zap,
} from "lucide-react";

export type AccountPageData = {
  profile: {
    id: number;
    name: string;
    email: string;
    initials: string;
    joinedAt: string;
  };
  stats: {
    totalProjects: number;
    completedProjects: number;
    recentProjectsCount: number;
    subtitleEntriesCount: number;
    activeDays: number;
  };
  overview: {
    latestActivity: string;
    accountStatus: string;
    workspaceState: string;
  };
  recentProjects: Array<{
    id: number;
    title: string;
    status: string;
    progress: number;
    updatedLabel: string;
    createdLabel: string;
  }>;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "草稿",
  UPLOADING: "上传中",
  PROCESSING: "处理中",
  COMPLETED: "已完成",
  FAILED: "失败",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  UPLOADING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-indigo-100 text-indigo-600",
  COMPLETED: "bg-emerald-100 text-emerald-600",
  FAILED: "bg-red-100 text-red-500",
};

export default function AccountPageClient({
  data,
}: {
  data: AccountPageData;
}) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("退出登录失败", error);
      setLogoutError("退出失败，请稍后重试。");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] px-4 py-8 text-slate-800 md:px-8 xl:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-[36px] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-3xl font-bold text-white shadow-lg shadow-indigo-200">
                {data.profile.initials}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                    {data.profile.name}
                  </h1>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    账号中心
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    {data.profile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    注册于 {data.profile.joinedAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                <Film size={18} />
                查看项目
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
              >
                <Plus size={18} />
                新建项目
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<BarChart3 className="text-indigo-600" />}
            label="总项目数"
            value={String(data.stats.totalProjects)}
            detail={`近 30 天新增 ${data.stats.recentProjectsCount} 个`}
            bgColor="bg-indigo-50/80"
          />
          <StatCard
            icon={<CheckCircle2 className="text-emerald-600" />}
            label="已完成项目"
            value={String(data.stats.completedProjects)}
            detail="已完成翻译或处理"
            bgColor="bg-emerald-50/80"
          />
          <StatCard
            icon={<Subtitles className="text-sky-600" />}
            label="字幕条目"
            value={String(data.stats.subtitleEntriesCount)}
            detail="当前账户下累计条目"
            bgColor="bg-sky-50/80"
          />
          <StatCard
            icon={<Zap className="text-amber-600" />}
            label="活跃天数"
            value={String(data.stats.activeDays)}
            detail="从注册当天开始计算"
            bgColor="bg-amber-50/80"
          />
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="space-y-8 xl:col-span-7">
            <section className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    账户概览
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    这里展示的是当前登录账号的实时信息。
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  用户 ID #{data.profile.id}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <MetaCard
                  icon={<UserCircle2 size={18} />}
                  label="账户状态"
                  value={data.overview.accountStatus}
                />
                <MetaCard
                  icon={<Clock size={18} />}
                  label="最近活动"
                  value={data.overview.latestActivity}
                />
                <MetaCard
                  icon={<Film size={18} />}
                  label="工作区状态"
                  value={data.overview.workspaceState}
                />
                <MetaCard
                  icon={<Mail size={18} />}
                  label="登录邮箱"
                  value={data.profile.email}
                />
              </div>
            </section>

            <section className="rounded-[32px] bg-slate-100/70 p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    最近项目
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    最近更新过的项目会显示在这里。
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  查看全部
                </Link>
              </div>

              {data.recentProjects.length === 0 ? (
                <div className="rounded-[28px] bg-white px-6 py-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
                  <p className="text-lg font-semibold text-slate-700">
                    还没有项目
                  </p>
                  <p className="mt-2 text-sm">
                    创建第一个项目后，这里会自动显示最近记录。
                  </p>
                  <Link
                    href="/projects/new"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus size={18} />
                    去创建
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentProjects.map((project) => (
                    <RecentProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6 xl:col-span-5">
            <section className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                安全与访问
              </h2>

              <div className="space-y-3">
                <SecurityRow
                  icon={<ShieldCheck size={20} />}
                  label="登录态保护"
                  value="Token 已通过 HttpOnly Cookie 管理"
                />
                <SecurityRow
                  icon={<Clock size={20} />}
                  label="注册时间"
                  value={data.profile.joinedAt}
                />
                <SecurityRow
                  icon={<Mail size={20} />}
                  label="主邮箱"
                  value={data.profile.email}
                />
              </div>
            </section>

            <section className="rounded-[32px] border border-red-100 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">会话管理</h2>
              <p className="mt-2 text-sm text-slate-400">
                退出后会清除当前浏览器中的登录态，并返回登录页。
              </p>

              {logoutError ? (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
                  {logoutError}
                </p>
              ) : null}

              <button
                onClick={() => {
                  handleLogout().catch(() => {});
                }}
                disabled={isLoggingOut}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-3xl border border-red-100 bg-red-50 py-4 font-bold text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={20} />
                {isLoggingOut ? "正在退出..." : "退出登录"}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  bgColor: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white bg-white p-6 shadow-sm ${bgColor}`}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function RecentProjectCard({
  project,
}: {
  project: AccountPageData["recentProjects"][number];
}) {
  const statusLabel = STATUS_LABEL[project.status] ?? project.status;
  const statusStyle =
    STATUS_STYLE[project.status] ?? "bg-slate-100 text-slate-500";

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">
            {project.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>创建于 {project.createdLabel}</span>
            <span>最近更新 {project.updatedLabel}</span>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600"
            style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
          />
        </div>
        <span className="min-w-[52px] text-right text-sm font-semibold text-slate-500">
          {project.progress}%
        </span>
        <ChevronRight size={18} className="text-slate-300" />
      </div>
    </Link>
  );
}

function SecurityRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-[24px] bg-slate-50 p-5">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
