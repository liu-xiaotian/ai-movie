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
  AlertCircle,
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
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoTranslated = useRef(false); // 关键：防止重复触发自动翻译

  // ── 核心逻辑：自动调整 TextArea 高度 ──
  const autoResize = (target: HTMLTextAreaElement) => {
    if (!target) return;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
  };

  // 只要 entries 变动，确保高度正确（特别是翻译流式进入时）
  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((ta) => autoResize(ta as HTMLTextAreaElement));
  }, [entries]);

  // ── 更新本地状态 ──
  const patchLocal = useCallback((entryId: number, text: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, translation: text } : e)),
    );
  }, []);

  // ── 保存到数据库 ──
  const saveTranslation = useCallback(
    async (entryId: number, translation: string) => {
      setSavingId(entryId);
      try {
        await fetch(`/api/projects/${projectId}/subtitles/${entryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ translation }),
        });
        setSavedId(entryId);
        setTimeout(() => setSavedId(null), 2000);
      } finally {
        setSavingId(null);
      }
    },
    [projectId],
  );

  // ── 单条翻译 (流式) ──
  const translateEntry = useCallback(
    async (entryId: number): Promise<string> => {
      setTranslatingId(entryId);
      let accumulated = "";

      try {
        const res = await fetch(`/api/projects/${projectId}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId }),
        });

        if (!res.ok) throw new Error("翻译失败");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              accumulated += delta;
              patchLocal(entryId, accumulated);
            } catch (e) {
              /* ignore */
            }
          }
        }
        if (accumulated) await saveTranslation(entryId, accumulated);
      } catch (e) {
        console.error(e);
      } finally {
        setTranslatingId(null);
      }
      return accumulated;
    },
    [projectId, patchLocal, saveTranslation],
  );

  // ── 批量翻译逻辑 ──
  const handleBatchTranslate = useCallback(
    async (targetEntries: Entry[]) => {
      const untranslated = targetEntries.filter((e) => !e.translation);
      if (untranslated.length === 0) return;

      setBatchProgress({ current: 0, total: untranslated.length });

      for (let i = 0; i < untranslated.length; i++) {
        setBatchProgress({ current: i + 1, total: untranslated.length });
        await translateEntry(untranslated[i].id);
      }
      setBatchProgress(null);
    },
    [translateEntry],
  );

  // ── 数据加载 ──
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}/subtitles`);
        if (!res.ok) throw new Error("加载失败");
        const data: Entry[] = await res.json();
        setEntries(data);

        // 只有在第一次加载成功且有未翻译内容时触发
        if (!hasAutoTranslated.current && data.some((e) => !e.translation)) {
          hasAutoTranslated.current = true;
          handleBatchTranslate(data);
        }
      } catch (e) {
        setError("获取字幕数据失败");
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [projectId, handleBatchTranslate]);

  // ── 手动编辑 ──
  const handleManualEdit = (id: number, value: string) => {
    patchLocal(id, value);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTranslation(id, value);
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
      {/* 顶部导航 */}
      <header className="sticky top-0 h-14 border-b border-slate-100 flex items-center px-8 shrink-0 bg-white/80 backdrop-blur-md z-40">
        <Link
          href={`/projects/${projectId}`}
          className="text-slate-400 hover:text-slate-900 transition-colors mr-6"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight">双语对照编辑器</h1>

        {/* 批量翻译进度指示器 */}
        {batchProgress && (
          <div className="ml-8 flex items-center gap-3 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
            <Loader2 size={14} className="animate-spin text-indigo-600" />
            <span className="text-[11px] font-bold text-indigo-600 uppercase">
              AI 自动翻译中 {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-2"
            >
              导出字幕{" "}
              <ChevronUp
                size={14}
                className={isExportOpen ? "" : "rotate-180"}
              />
            </button>
            {isExportOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 shadow-2xl rounded-xl p-1 z-50">
                <button
                  onClick={() => handleExport("srt")}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  导出 SRT
                </button>
                <button
                  onClick={() => handleExport("vtt")}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg mt-1"
                >
                  导出 VTT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 表头 */}
      <div className="sticky top-14 grid grid-cols-2 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm z-30">
        <div className="px-12 py-3 border-r border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          原文
        </div>
        <div className="px-12 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          译文
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-2">
            <AlertCircle size={24} />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={`grid grid-cols-2 transition-colors ${selectedId === entry.id ? "bg-indigo-50/10" : ""}`}
              >
                {/* 左侧原文 */}
                <section className="px-12 py-10 border-r border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px]">
                    <Clock size={12} /> {entry.startTime.split(",")[0]}
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages
                      size={18}
                      className="mt-1 text-slate-300 shrink-0"
                    />
                    <p className="text-xl font-medium text-slate-500 leading-relaxed">
                      {entry.original}
                    </p>
                  </div>
                </section>

                {/* 右侧编辑 */}
                <section className="px-12 py-10 space-y-3 relative">
                  <div className="flex justify-end items-center h-4 absolute top-4 right-12">
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

                  <div className="relative group w-full">
                    <textarea
                      value={entry.translation ?? ""}
                      onChange={(e) =>
                        handleManualEdit(entry.id, e.target.value)
                      }
                      placeholder={
                        translatingId === entry.id
                          ? "正在翻译..."
                          : "点击输入译文..."
                      }
                      className="w-full p-4 overflow-hidden resize-none outline-none rounded-xl text-2xl font-medium leading-relaxed text-indigo-600 placeholder:text-slate-200 border-none bg-transparent hover:bg-indigo-50/30 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    {translatingId === entry.id && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-2 px-3 py-1 bg-white shadow-sm rounded-full text-[10px] text-indigo-500 animate-pulse border border-indigo-100">
                        <Sparkles size={10} /> AI 正在构思
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        textarea {
          min-height: 80px;
          display: block;
        }
      `}</style>
    </div>
  );
}
