"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Languages,
  Sparkles,
  Save,
  Download,
  CheckCircle2,
  ChevronUp,
  FileText,
  Type,
  Loader2,
  Check,
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

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  // ── Load entries ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/subtitles`);
        if (!res.ok) throw new Error("加载字幕失败");
        const data: Entry[] = await res.json();
        setEntries(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载字幕失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // ── Update entry translation in local state ─────────────────────────────────
  const patchLocal = useCallback((entryId: number, text: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, translation: text } : e)),
    );
  }, []);

  // ── Save single translation to DB ───────────────────────────────────────────
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

  // ── Translate one entry (streaming) ─────────────────────────────────────────
  const translateEntry = useCallback(
    async (entryId: number): Promise<string> => {
      setTranslatingId(entryId);
      setError("");

      let accumulated = "";

      try {
        const res = await fetch(`/api/projects/${projectId}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "翻译失败");
        }

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
            } catch {
              // ignore malformed SSE lines
            }
          }
        }

        // Persist after streaming finishes
        if (accumulated) await saveTranslation(entryId, accumulated);
      } catch (e) {
        setError(e instanceof Error ? e.message : "翻译失败");
      } finally {
        setTranslatingId(null);
      }

      return accumulated;
    },
    [projectId, patchLocal, saveTranslation],
  );

  // ── Translate current selected entry ────────────────────────────────────────
  const handleTranslateCurrent = () => {
    if (!selectedId || translatingId !== null) return;
    translateEntry(selectedId);
  };

  // ── Batch translate all untranslated entries ─────────────────────────────────
  const handleBatchTranslate = async () => {
    if (translatingId !== null || batchProgress !== null) return;
    const untranslated = entries.filter((e) => !e.translation);
    if (untranslated.length === 0) return;

    setBatchProgress({ current: 0, total: untranslated.length });
    for (let i = 0; i < untranslated.length; i++) {
      setBatchProgress({ current: i + 1, total: untranslated.length });
      await translateEntry(untranslated[i].id);
    }
    setBatchProgress(null);
  };

  // ── Manual textarea edit with debounced save ─────────────────────────────────
  const handleTranslationChange = (value: string) => {
    if (!selectedId) return;
    patchLocal(selectedId, value);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTranslation(selectedId, value);
    }, 1000);
  };

  // ── Manual save button ──────────────────────────────────────────────────────
  const handleSave = () => {
    if (!selected) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTranslation(selected.id, selected.translation ?? "");
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = (format: "srt" | "vtt") => {
    const exportData = entries.map((e) => ({
      index: e.index,
      startTime: e.startTime,
      endTime: e.endTime,
      original: e.original,
      translation: e.translation,
    }));
    const content =
      format === "srt" ? entriesToSRT(exportData) : entriesToVTT(exportData);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const translatedCount = entries.filter((e) => e.translation).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top nav */}
      <div className="h-14 border-b border-slate-100 flex items-center px-4 gap-3 shrink-0 bg-white">
        <Link
          href={`/projects/${projectId}`}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="w-px h-5 bg-slate-100" />
        <span className="text-sm font-medium text-slate-500">返回项目详情</span>

        {/* Batch progress indicator */}
        {batchProgress && (
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin text-indigo-600" />
            <span>
              批量翻译中 {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
        )}

        {/* Translation stats */}
        {!batchProgress && entries.length > 0 && (
          <div className="ml-auto text-xs text-slate-400 font-medium">
            已翻译 {translatedCount} / {entries.length} 条
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Timeline */}
        <aside className="w-72 border-r border-slate-100 flex flex-col bg-[#F8F9FD]/50 shrink-0">
          {/* Timeline header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              时间轴
            </span>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              {entries.length > 0 && (
                <button
                  onClick={handleBatchTranslate}
                  disabled={
                    batchProgress !== null ||
                    translatingId !== null ||
                    entries.every((e) => !!e.translation)
                  }
                  className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  全部翻译
                </button>
              )}
            </div>
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
            {!loading && entries.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <FileText size={28} className="mx-auto mb-2 opacity-30" />
                暂无字幕条目
                <br />
                请先上传字幕文件
              </div>
            )}
            {entries.map((entry) => {
              const isSelected = entry.id === selectedId;
              const isTranslating = entry.id === translatingId;
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? "bg-white border-indigo-200 shadow-md shadow-indigo-100/50 ring-2 ring-indigo-50"
                      : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`text-[10px] font-bold tabular-nums ${isSelected ? "text-indigo-600" : "text-slate-400"}`}
                    >
                      {entry.startTime.slice(0, 8)}
                    </span>
                    {isTranslating ? (
                      <Loader2
                        size={12}
                        className="text-indigo-400 animate-spin"
                      />
                    ) : entry.translation ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    )}
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? "text-slate-700 font-medium" : "text-slate-400"}`}
                  >
                    {entry.original}
                  </p>
                  {entry.translation && (
                    <p className="text-[11px] leading-relaxed text-indigo-500 mt-1 line-clamp-1">
                      {entry.translation}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Editor */}
        <main className="flex-1 flex flex-col relative bg-[#F8F9FD]/30 overflow-hidden">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-2xl shadow-lg">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {selected ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full px-12 pt-16 pb-32 space-y-10">
                {/* Time range */}
                <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
                  <Clock size={13} />
                  {selected.startTime} → {selected.endTime}
                </div>

                {/* Original text */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Languages size={15} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      原文
                    </span>
                  </div>
                  <p className="text-2xl font-medium text-slate-500 leading-snug">
                    {selected.original}
                  </p>
                </section>

                {/* Translation */}
                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Sparkles
                        size={15}
                        fill={selected.translation ? "currentColor" : "none"}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        AI 翻译（中文）
                      </span>
                    </div>
                    <button
                      onClick={handleTranslateCurrent}
                      disabled={
                        translatingId !== null || batchProgress !== null
                      }
                      className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {translatingId === selected.id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          翻译中…
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          {selected.translation ? "重新翻译" : "翻译此句"}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={selected.translation ?? ""}
                      onChange={(e) => handleTranslationChange(e.target.value)}
                      placeholder={
                        translatingId === selected.id
                          ? "正在翻译…"
                          : "点击「翻译此句」让 AI 翻译，或直接输入译文"
                      }
                      className="w-full min-h-[180px] bg-white border-2 border-slate-900 rounded-2xl p-6 text-2xl leading-relaxed outline-none resize-none font-medium text-slate-800 placeholder:text-slate-200 placeholder:text-base transition-all focus:border-indigo-400"
                    />
                    {translatingId === selected.id && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 size={11} className="animate-spin" />
                        生成中…
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-300">
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <p className="text-sm">从左侧选择一条字幕开始编辑</p>
              )}
            </div>
          )}

          {/* Floating toolbar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="relative">
              {/* Export dropdown */}
              {isExportOpen && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-40 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[24px] shadow-2xl overflow-hidden">
                  <button
                    onClick={() => handleExport("srt")}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FileText size={15} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        导出为
                      </p>
                      <p className="text-sm font-bold text-slate-700">SRT</p>
                    </div>
                  </button>
                  <div className="h-px bg-slate-50 mx-4" />
                  <button
                    onClick={() => handleExport("vtt")}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-indigo-600 bg-white p-2 rounded-lg border border-slate-100 group-hover:border-indigo-200 transition-all">
                      <Type size={15} />
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

              {/* Toolbar */}
              <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-2xl shadow-indigo-100/30 px-3 py-2 rounded-[24px]">
                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={!selected || savingId === selected?.id}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-all relative"
                  title="保存"
                >
                  {savingId === selected?.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : savedId === selected?.id ? (
                    <Check size={20} className="text-emerald-500" />
                  ) : (
                    <Save size={20} />
                  )}
                </button>

                <div className="w-px h-6 bg-slate-100 mx-1" />

                {/* Export toggle */}
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl transition-all ${
                    isExportOpen
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                  title="导出"
                >
                  <Download size={20} />
                  <ChevronUp
                    size={14}
                    className={`transition-transform duration-300 ${isExportOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div className="w-px h-6 bg-slate-100 mx-1" />

                {/* AI translate current */}
                <button
                  onClick={handleTranslateCurrent}
                  disabled={
                    !selected ||
                    translatingId !== null ||
                    batchProgress !== null
                  }
                  className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl disabled:opacity-40 transition-all"
                  title="翻译此句"
                >
                  {translatingId !== null ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
