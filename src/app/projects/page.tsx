import React from "react";
import {
  Search,
  Folder,
  Zap,
  HelpCircle,
  Settings,
  User,
  Plus,
  Filter,
  MoreVertical,
  Clock,
} from "lucide-react";

const ProjectsPage = () => {
  const projects = [
    {
      id: 1,
      title: "星际穿越",
      time: "2 小时前",
      status: "进行中",
      progress: 65,
      img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=200",
    },
    {
      id: 2,
      title: "银翼杀手 2049",
      time: "1 天前",
      status: "进行中",
      progress: 92,
      img: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=200",
    },
    {
      id: 3,
      title: "降临",
      time: "3 天前",
      status: "已完成",
      progress: 100,
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200",
    },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FD] text-slate-800">
      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-slate-900">项目</h2>
              <p className="text-slate-400">管理您的字幕翻译工作流。</p>
            </div>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              <Plus size={18} strokeWidth={3} /> 新建项目
            </button>
          </div>

          {/* Search & Filter Bar */}
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

          {/* Project List */}
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectItem key={project.id} {...project} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-component: Project ListItem ---
const ProjectItem = ({ title, time, status, progress, img }: any) => {
  const isDone = status === "已完成";

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-6 hover:shadow-md hover:shadow-slate-200/50 transition-all cursor-pointer group">
      {/* Thumbnail */}
      <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content Area */}
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
          <button className="text-slate-300 hover:text-slate-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Progress Bar Container */}
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
};

export default ProjectsPage;
