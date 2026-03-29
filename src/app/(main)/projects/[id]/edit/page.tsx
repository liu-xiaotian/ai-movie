"use client";

import React, { useState } from "react";
import {
  Clock,
  Languages,
  Sparkles,
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Type,
} from "lucide-react";

export default function SubtitleEditor() {
  const [translation, setTranslation] = useState(
    "静态干扰仍在继续。有人能通过传输听到我的声音吗？",
  );
  const [isExportOpen, setIsExportOpen] = useState(false);
  const subtitleList = [
    {
      id: 1,
      time: "00:00:12,450",
      text: "Static interference is continuing. Can anyone hear me through the...",
      active: true,
    },
    {
      id: 2,
      time: "00:00:15,200",
      text: "Wait, I am receiving a signal from the auxiliary module.",
      active: false,
    },
    {
      id: 3,
      time: "00:00:18,500",
      text: "Commander Lewis, do you copy? Landing Zone 4 is clear for descent.",
      active: false,
    },
  ];

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* --- 左侧时间轴列表 --- */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-[#F8F9FD]/50">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            时间轴
          </span>
          <Clock size={16} className="text-slate-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {subtitleList.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                item.active
                  ? "bg-white border-indigo-200 shadow-md shadow-indigo-100/50 ring-2 ring-indigo-50"
                  : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-[10px] font-bold ${item.active ? "text-indigo-600" : "text-slate-400"}`}
                >
                  {item.time}
                </span>
                <CheckCircle2
                  size={14}
                  className={item.active ? "text-indigo-400" : "text-slate-200"}
                />
              </div>
              <p
                className={`text-xs leading-relaxed line-clamp-2 ${item.active ? "text-slate-700 font-medium" : "text-slate-400"}`}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* --- 右侧编辑区 --- */}
      <main className="flex-1 flex flex-col relative bg-[#F8F9FD]/30">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-16 pt-24 space-y-12">
          {/* 原文展示区 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Languages size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                原文 (英语)
              </span>
            </div>
            <h2 className="text-3xl font-medium text-slate-600 leading-snug">
              Static interference is continuing. Can anyone hear me through the
              transmission?
            </h2>
          </section>

          {/* 译文编辑区 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI 翻译 (中文)
                </span>
              </div>
              <button className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                重新生成
              </button>
            </div>

            <div className="relative group">
              <textarea
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full h-64 bg-transparent border-2 border-slate-900 rounded-lg p-6 text-4xl leading-relaxed outline-none resize-none font-medium text-slate-800"
              />
              {/* 模拟光标或聚焦边框的装饰 */}
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </section>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="relative">
            {/* --- 弹出菜单 (Dropdown) --- */}
            {isExportOpen && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-40 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
                <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      导出为
                    </p>
                    <p className="text-sm font-bold text-slate-700">SRT</p>
                  </div>
                </button>

                <div className="h-px bg-slate-50 mx-4" />

                <button className="w-full flex items-center gap-3 p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors group">
                  <div className="text-indigo-600 bg-white p-2 rounded-lg border border-slate-100 group-hover:border-indigo-200 transition-all">
                    <Type size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      导出为
                    </p>
                    <p className="text-sm font-bold text-slate-700">VTT</p>
                  </div>
                </button>
              </div>
            )}

            {/* --- 主工具栏 --- */}
            <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-2xl shadow-indigo-100/30 px-3 py-2 rounded-[24px]">
              {/* 保存按钮 */}
              <button className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <Save size={20} />
              </button>

              <div className="w-px h-6 bg-slate-100 mx-1" />

              {/* 导出按钮 (触发器) */}
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl transition-all ${
                  isExportOpen
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <Download size={20} />
                <ChevronUp
                  size={14}
                  className={`transition-transform duration-300 ${isExportOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div className="w-px h-6 bg-slate-100 mx-1" />

              {/* AI 增强按钮 */}
              <button className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Sparkles size={20} fill="none" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
