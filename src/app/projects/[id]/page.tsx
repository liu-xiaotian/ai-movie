import React from "react";
import {
  ArrowLeft,
  Share2,
  Settings,
  Play,
  Languages,
  FileText,
  Hash,
  Clock,
  Film,
  Shield,
  User,
  Download,
  Sparkles,
  History,
} from "lucide-react";

export default function ProjectDetail() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 text-slate-800">
      {/* --- Top Header --- */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-100">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">星际穿越</h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full font-medium">
                进行中
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <Clock size={14} /> 最后修改于 2 小时前
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:shadow-sm transition-all">
            <Share2 size={20} />
          </button>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:shadow-sm transition-all">
            <Settings size={20} />
          </button>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <Play size={18} fill="currentColor" /> 继续编辑
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* --- Left Column (Main Content) --- */}
        <div className="col-span-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={<Languages className="text-indigo-600" />}
              label="源语言"
              value="英语"
            />
            <StatCard
              icon={<Languages className="text-indigo-600" />}
              label="目标语言"
              value="中文 (简体)"
            />
            <StatCard
              icon={<FileText className="text-indigo-600" />}
              label="文件大小"
              value="124 KB"
            />
            <StatCard
              icon={<Hash className="text-indigo-600" />}
              label="字幕条数"
              value="1,420"
            />
          </div>

          {/* Movie Info Section */}
          <section className="bg-[#EDF2F7]/50 border border-white/50 rounded-[40px] p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="text-indigo-600">
                <Play size={24} className="rotate-180" />
              </div>
              <h3 className="text-xl font-bold">电影信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <InfoRow icon={<FileText />} label="电影标题" value="星际穿越" />
              <InfoRow icon={<Shield />} label="分级" value="PG-13" />
              <InfoRow icon={<History />} label="上映年份" value="2014" />
              <InfoRow icon={<User />} label="导演" value="克里斯托弗·诺兰" />
              <InfoRow icon={<Clock />} label="时长" value="169 分钟" />
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <History className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold">最近活动</h3>
            </div>
            <div className="space-y-6">
              <ActivityItem
                title="AI 翻译建议已生成"
                meta="系统 • 1 小时前"
                icon={<User className="text-slate-400" />}
              />
              <ActivityItem
                title="修改了第 42-50 行字幕"
                meta="Xiaotian • 2 小时前"
                icon={<div className="w-2 h-2 bg-indigo-400 rounded-full" />}
              />
            </div>
          </section>
        </div>

        {/* --- Right Column (Meta & Tools) --- */}
        <div className="col-span-4 space-y-6">
          {/* Project Details Panel */}
          <div className="bg-[#EDF2F7]/40 rounded-[40px] p-8 border border-white/40">
            <h3 className="text-xl font-bold mb-6">项目详情</h3>
            <div className="space-y-6">
              <MetaRow label="创建日期" value="2026-03-20" />
              <MetaRow label="所有者" value="Xiaotian" />
              <MetaRow
                label="AI 增强"
                value={
                  <span className="flex items-center gap-1 text-indigo-600 font-bold">
                    <Sparkles size={14} fill="currentColor" /> 已启用
                  </span>
                }
              />
            </div>

            <div className="mt-12 space-y-3">
              <p className="text-slate-400 text-sm font-medium mb-4">
                导出选项
              </p>
              <ExportButton label="导出为 .SRT" />
              <ExportButton label="导出为 .VTT" />
            </div>
          </div>

          {/* Terminology Card */}
          <div className="bg-indigo-50/50 rounded-[40px] p-8 border border-indigo-100/50">
            <div className="flex items-center gap-2 text-indigo-600 mb-6">
              <Sparkles size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                专业术语解释
              </span>
            </div>
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-bold text-indigo-900 mb-1 uppercase">
                  虫洞 (Wormhole)
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  连接时空两个不同点的理论通道。在电影中是前往另一个星系的捷径。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 mb-1 uppercase">
                  事件视界 (Event Horizon)
                </h4>
                <p className="text-slate-500 leading-relaxed">
                  黑洞周围的边界，任何物质甚至光线一旦进入便无法逃脱。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className="mb-4">{icon}</div>
    <p className="text-slate-400 text-xs mb-1 font-medium">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const InfoRow = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-slate-200/50 rounded-xl text-slate-500">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium mb-0.5">{label}</p>
      <p className="font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const MetaRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-400 font-medium">{label}</span>
    <span className="font-bold text-slate-700">{value}</span>
  </div>
);

const ExportButton = ({ label }: any) => (
  <button className="w-full flex justify-between items-center bg-slate-200/40 hover:bg-slate-200/60 p-4 rounded-2xl transition-all group">
    <div className="flex items-center gap-3 font-bold text-slate-700">
      <Download size={18} /> {label}
    </div>
    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
      →
    </span>
  </button>
);

const ActivityItem = ({ title, meta, icon }: any) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-700 leading-none mb-1">{title}</h4>
      <p className="text-xs text-slate-400">{meta}</p>
    </div>
  </div>
);
