import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Search, Plus, Filter, MoreVertical, Clock } from "lucide-react";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "草稿",
  UPLOADING: "上传中",
  PROCESSING: "进行中",
  COMPLETED: "已完成",
  FAILED: "失败",
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

async function getProjects() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return [];
  const payload = verifyToken(token);
  if (!payload) return [];

  return prisma.project.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
  });
}

const ProjectsPage = async () => {
  const projects = await getProjects();

  return (
    <div className="flex h-screen bg-[#F8F9FD] text-slate-800">
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-slate-900">项目</h2>
              <p className="text-slate-400">管理您的字幕翻译工作流。</p>
            </div>
            <Link
              href="/projects/new"
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} strokeWidth={3} /> 新建项目
            </Link>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="搜索项目..."
                className="w-full bg-slate-100/80 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-slate-100/80 px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors">
              <Filter size={18} /> 筛选
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <p className="text-lg font-medium mb-2">暂无项目</p>
              <p className="text-sm">
                点击右上角「新建项目」开始您的第一个翻译任务
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  time={formatRelativeTime(project.createdAt)}
                  status={STATUS_LABEL[project.status] ?? project.status}
                  progress={project.progress}
                  isDone={project.status === "COMPLETED"}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProjectItem = ({
  id,
  title,
  time,
  status,
  progress,
  isDone,
}: {
  id: number;
  title: string;
  time: string;
  status: string;
  progress: number;
  isDone: boolean;
}) => (
  <Link href={`/projects/${id}`}>
    <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-6 hover:shadow-md hover:shadow-slate-200/50 transition-all cursor-pointer group">
      <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
        <span className="text-slate-300 text-3xl font-bold">
          {title.charAt(0)}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between h-20 py-1">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-lg text-slate-800">{title}</h4>
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
          <span className="text-slate-300 hover:text-slate-600 transition-colors">
            <MoreVertical size={20} />
          </span>
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
  </Link>
);

export default ProjectsPage;
