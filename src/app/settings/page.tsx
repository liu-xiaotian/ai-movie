import React from "react";
import {
  Globe,
  Moon,
  Sun,
  Sparkles,
  Languages,
  CheckCircle2,
  Download,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 px-12 py-10 pb-28 relative">
      <div className="max-w-4xl mx-auto">
        {/* --- Header --- */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">设置</h1>
          <p className="text-slate-400 font-medium">
            自定义您的翻译体验和偏好。
          </p>
        </header>

        <div className="space-y-10">
          {/* --- Section: 常规 --- */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
              常规
            </h3>
            <div className="bg-slate-100/50 rounded-[32px] overflow-hidden border border-white/50">
              <SettingRow
                icon={<Globe size={20} />}
                title="界面语言"
                desc="选择您偏好的应用语言"
                action={
                  <span className="text-indigo-600 font-bold text-sm cursor-pointer">
                    简体中文
                  </span>
                }
              />
              <SettingRow
                icon={<Moon size={20} />}
                title="外观模式"
                desc="切换深色或浅色主题"
                isLast
                action={<ThemeSwitcher />}
              />
            </div>
          </section>

          {/* --- Section: AI 翻译 --- */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
              AI 翻译
            </h3>
            <div className="bg-slate-100/50 rounded-[32px] overflow-hidden border border-white/50">
              <SettingRow
                icon={<Sparkles size={20} />}
                title="默认翻译模型"
                desc="选择用于字幕翻译的 AI 模型"
                action={
                  <span className="text-indigo-600 font-bold text-sm cursor-pointer">
                    Gemini 1.5 Pro
                  </span>
                }
              />
              <SettingRow
                icon={<Languages size={20} />}
                title="翻译风格"
                desc="设置默认的翻译语气和风格"
                action={
                  <span className="text-slate-600 font-bold text-sm">
                    自然 / 现代
                  </span>
                }
              />
              <SettingRow
                icon={<CheckCircle2 size={20} />}
                title="自动术语库"
                desc="自动识别并应用项目术语库"
                isLast
                action={<Switch active />}
              />
            </div>
          </section>

          {/* --- Section: 导出与通知 --- */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
              导出与通知
            </h3>
            <div className="bg-slate-100/50 rounded-[32px] overflow-hidden border border-white/50">
              <SettingRow
                icon={<Download size={20} />}
                title="默认导出格式"
                desc="设置下载字幕时的首选格式"
                action={
                  <span className="text-slate-600 font-bold text-sm">.SRT</span>
                }
              />
              <SettingRow
                icon={<Bell size={20} />}
                title="通知设置"
                desc="管理翻译完成或系统提醒"
                isLast
                action={<ChevronRight size={18} className="text-slate-400" />}
              />
            </div>
          </section>

          {/* --- Section: 安全 --- */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
              安全
            </h3>
            <div className="bg-slate-100/50 rounded-[32px] overflow-hidden border border-white/50">
              <SettingRow
                icon={<Shield size={20} />}
                title="隐私设置"
                desc="管理您的数据和隐私偏好"
                isLast
                action={<ChevronRight size={18} className="text-slate-400" />}
              />
            </div>
          </section>
          {/* --- 修改后的 Bottom Actions --- */}
          <div className="max-w-4xl mx-auto flex justify-end gap-6 items-center">
            <button className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
              取消
            </button>
            <button className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              保存更改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const SettingRow = ({ icon, title, desc, action, isLast }: any) => (
  <div
    className={`flex items-center justify-between p-6 group hover:bg-white/40 transition-colors ${!isLast ? "border-b border-white/60" : ""}`}
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-slate-200/50 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-slate-400 text-xs font-medium">{desc}</p>
      </div>
    </div>
    <div>{action}</div>
  </div>
);

const ThemeSwitcher = () => (
  <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200/50">
    <button className="p-1.5 bg-white rounded-lg shadow-sm text-slate-600">
      <Sun size={14} />
    </button>
    <button className="p-1.5 text-slate-400 hover:text-slate-600">
      <Moon size={14} />
    </button>
  </div>
);

const Switch = ({ active }: { active?: boolean }) => (
  <div
    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${active ? "bg-indigo-600" : "bg-slate-300"}`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${active ? "left-7" : "left-1"}`}
    />
  </div>
);
