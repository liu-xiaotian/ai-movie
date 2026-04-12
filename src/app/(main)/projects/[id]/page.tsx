import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  Play,
  Clock,
  FileText,
  Hash,
  Download,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenLine,
} from "lucide-react";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "草稿",
  UPLOADING: "上传中",
  PROCESSING: "进行中",
  COMPLETED: "已完成",
  FAILED: "失败",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  UPLOADING: "bg-yellow-100 text-yellow-600",
  PROCESSING: "bg-indigo-100 text-indigo-600",
  COMPLETED: "bg-emerald-100 text-emerald-600",
  FAILED: "bg-red-100 text-red-500",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function getProject(id: number) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  return prisma.project.findFirst({
    where: { id, userId: payload.userId },
    include: { files: true },
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(Number(id));

  if (!project) notFound();

  const totalSize = project.files.reduce((sum, f) => sum + f.size, 0);
  const subtitleFiles = project.files.filter((f) => f.fileType === "SUBTITLE");
  const stepLabel = ["", "填写基本信息", "上传字幕源", "AI 配置"];

  return (
    <div className=" bg-[#F8F9FD] p-8 text-slate-800">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-100"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.title}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${STATUS_COLOR[project.status] ?? "bg-slate-100 text-slate-500"}`}
              >
                {STATUS_LABEL[project.status] ?? project.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <Clock size={14} /> 最后修改于{" "}
              {formatRelativeTime(project.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/projects/${project.id}/edit`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <PenLine size={18} /> 继续编辑
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={<Hash className="text-indigo-600" size={22} />}
              label="当前步骤"
              value={`步骤 ${project.currentStep}`}
            />
            <StatCard
              icon={<FileText className="text-indigo-600" size={22} />}
              label="上传文件"
              value={`${subtitleFiles.length} 个`}
            />
            <StatCard
              icon={<FolderOpen className="text-indigo-600" size={22} />}
              label="文件总大小"
              value={totalSize > 0 ? formatFileSize(totalSize) : "—"}
            />
            <StatCard
              icon={<Play className="text-indigo-600" size={22} />}
              label="完成进度"
              value={`${project.progress}%`}
            />
          </div>

          {/* Progress Bar */}
          {/* <section className="bg-[#EDF2F7]/50 border border-white/50 rounded-[40px] p-10">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="text-indigo-600" size={22} />
              <h3 className="text-xl font-bold">创建进度</h3>
            </div>
            <div className="space-y-5">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      project.currentStep > step
                        ? "bg-emerald-500 text-white"
                        : project.currentStep === step
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    {project.currentStep > step ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span className="text-xs font-bold">{step}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        project.currentStep >= step
                          ? "text-slate-700"
                          : "text-slate-300"
                      }`}
                    >
                      {stepLabel[step]}
                    </p>
                  </div>
                  {project.currentStep === step &&
                    project.status !== "COMPLETED" && (
                      <span className="text-xs text-indigo-500 font-medium">
                        当前步骤
                      </span>
                    )}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                <span>总进度</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </section> */}

          {/* Uploaded Files */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-indigo-600" size={22} />
              <h3 className="text-xl font-bold">上传的文件</h3>
            </div>
            {project.files.length === 0 ? (
              <div className="text-center py-12 text-slate-300 bg-white rounded-3xl border border-slate-100">
                <FileText size={36} className="mx-auto mb-3" />
                <p className="text-sm font-medium">暂无文件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {file.extension?.toUpperCase()} ·{" "}
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium shrink-0">
                      {file.fileType === "SUBTITLE" ? "字幕源" : "译文"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">
          {/* Project Info */}
          <div className="bg-[#EDF2F7]/40 rounded-[40px] p-8 border border-white/40">
            <h3 className="text-xl font-bold mb-6">项目详情</h3>
            <div className="space-y-5">
              <MetaRow label="项目 ID" value={`#${project.id}`} />
              <MetaRow label="创建日期" value={formatDate(project.createdAt)} />
              <MetaRow
                label="状态"
                value={
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[project.status]}`}
                  >
                    {STATUS_LABEL[project.status]}
                  </span>
                }
              />
              <MetaRow
                label="AI 增强"
                value={
                  <span className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                    <Sparkles size={13} fill="currentColor" /> 已启用
                  </span>
                }
              />
            </div>

            {project.description && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-2">
                  项目描述
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <p className="text-slate-400 text-sm font-medium mb-3">
                导出选项
              </p>
              <ExportButton label="导出为 .SRT" />
              <ExportButton label="导出为 .VTT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className="mb-4">{icon}</div>
    <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const MetaRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-400 font-medium">{label}</span>
    <span className="font-bold text-slate-700">{value}</span>
  </div>
);

const ExportButton = ({ label }: { label: string }) => (
  <button className="w-full flex justify-between items-center bg-slate-200/40 hover:bg-slate-200/60 p-4 rounded-2xl transition-all group">
    <div className="flex items-center gap-3 font-bold text-slate-700 text-sm">
      <Download size={16} /> {label}
    </div>
    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
      →
    </span>
  </button>
);
