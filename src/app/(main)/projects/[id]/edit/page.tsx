"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Save,
  Download,
  ChevronUp,
  Loader2,
  Check,
  Languages,
} from "lucide-react";
import { entriesToSRT, entriesToVTT } from "@/lib/subtitle-parser";

type Entry = {
  id: number;
  index: number;
  startTime: string;
  endTime: string;
  original: string;
  translation: string | null;
};

export default function SubtitleEditor() {
  const params = useParams();
  const projectId = params.id as string;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [translatingId, setTranslatingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 核心逻辑：自动调整 TextArea 高度 ──
  const autoResize = (target: HTMLTextAreaElement) => {
    if (!target) return;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
  };

  useEffect(() => {
    if (!loading && entries.length > 0) {
      const timer = setTimeout(() => {
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach((ta) => autoResize(ta as HTMLTextAreaElement));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, entries.length]);

  // ── 数据加载 ──
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/subtitles`);
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // ── 保存逻辑 ──
  const handleTranslationChange = (id: number, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, translation: value } : e)),
    );

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSavingId(id);
      try {
        await fetch(`/api/projects/${projectId}/subtitles/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ translation: value }),
        });
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2000);
      } finally {
        setSavingId(null);
      }
    }, 1000);
  };

  const handleExport = (format: "srt" | "vtt") => {
    const content =
      format === "srt" ? entriesToSRT(entries) : entriesToVTT(entries);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. 固定顶部导航 */}
      <header className="sticky top-0 h-14 border-b border-slate-100 flex items-center px-8 shrink-0 bg-white/80 backdrop-blur-md z-40">
        <Link
          href={`/projects/${projectId}`}
          className="text-slate-400 hover:text-slate-900 transition-colors mr-6"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight">双语对照编辑器</h1>

        <div className="ml-auto flex items-center gap-6">
          {/* 修正：导出菜单容器 */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-2 py-2"
            >
              导出字幕{" "}
              <ChevronUp
                size={14}
                className={`transition-transform duration-200 ${isExportOpen ? "" : "rotate-180"}`}
              />
            </button>

            {/* 修正：使用 absolute 定位在按钮下方 */}
            {isExportOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 shadow-2xl rounded-xl p-1 z-50">
                <button
                  onClick={() => handleExport("srt")}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  导出 SRT
                </button>
                <button
                  onClick={() => handleExport("vtt")}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg mt-1 transition-colors"
                >
                  导出 VTT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. 固定左右表头 */}
      <div className="sticky top-14 grid grid-cols-2 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm z-30 shrink-0">
        <div className="px-12 py-3 border-r border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          原文 (Source)
        </div>
        <div className="px-12 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          译文 (Translation)
        </div>
      </div>

      {/* 3. 内容主体 */}
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={`grid grid-cols-2 transition-colors ${selectedId === entry.id ? "bg-indigo-50/10" : ""}`}
              >
                {/* 左侧：原文展示区 */}
                <section className="px-12 py-10 border-r border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] ">
                    <Clock size={12} />
                    {entry.startTime.split(",")[0]}
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages
                      size={18}
                      className="mt-1 text-slate-300 shrink-0"
                    />
                    <p className="text-xl font-medium text-slate-500 leading-relaxed break-words">
                      {entry.original}
                    </p>
                  </div>
                </section>

                {/* 右侧：编辑区 */}
                <section className="px-12 py-10 space-y-3">
                  <div className="flex justify-end items-center h-4">
                    <div className="flex items-center gap-2">
                      {savingId === entry.id && (
                        <Loader2
                          size={12}
                          className="animate-spin text-indigo-400"
                        />
                      )}
                      {savedId === entry.id && (
                        <Check size={12} className="text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="relative group w-full">
                    <textarea
                      value={entry.translation ?? ""}
                      onChange={(e) =>
                        handleTranslationChange(entry.id, e.target.value)
                      }
                      onInput={(e) =>
                        autoResize(e.target as HTMLTextAreaElement)
                      }
                      placeholder={
                        translatingId === entry.id
                          ? "正在翻译…"
                          : "点击输入译文..."
                      }
                      className="w-full p-4 overflow-hidden resize-none outline-none transition-all duration-150 rounded-xl text-2xl font-medium leading-relaxed text-indigo-400 placeholder:text-slate-300 placeholder:text-lg border-none bg-transparent hover:bg-indigo-50/50 focus:ring-2 focus:ring-indigo-300 focus:bg-white focus:text-black"
                    />

                    {translatingId === entry.id ? (
                      <div className="absolute bottom-2 right-2 flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-indigo-500 animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        <span>AI 翻译中</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-0 transition-opacity pointer-events-none">
                        <span className="text-xs text-indigo-300 font-light italic">
                          点击可修改
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 全局 CSS */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        textarea {
          overflow: hidden !important;
          min-height: 80px;
          display: block;
        }
      `}</style>
    </div>
  );
}
