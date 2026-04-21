"use client";

import { Download } from "lucide-react";
import { entriesToSRT, entriesToVTT } from "@/lib/subtitle-parser";

type ExportEntry = {
  index: number;
  startTime: string;
  endTime: string;
  original: string;
  translation: string | null;
};

type ProjectSubtitleExportButtonsProps = {
  entries: ExportEntry[];
};

function downloadSubtitle(entries: ExportEntry[], format: "srt" | "vtt") {
  const content =
    format === "srt" ? entriesToSRT(entries) : entriesToVTT(entries);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `subtitles.${format}`;
  anchor.click();

  URL.revokeObjectURL(url);
}

export default function ProjectSubtitleExportButtons({
  entries,
}: ProjectSubtitleExportButtonsProps) {
  const canExport = entries.length > 0;

  return (
    <div className="mt-8 space-y-3">
      <p className="mb-3 text-sm font-medium text-slate-400">导出选项</p>
      <ExportButton
        label="导出为 .SRT"
        disabled={!canExport}
        onClick={() => downloadSubtitle(entries, "srt")}
      />
      <ExportButton
        label="导出为 .VTT"
        disabled={!canExport}
        onClick={() => downloadSubtitle(entries, "vtt")}
      />

      {!canExport ? (
        <p className="text-xs leading-5 text-slate-400">
          当前还没有可导出的字幕条目，请先上传字幕并完成生成。
        </p>
      ) : null}
    </div>
  );
}

type ExportButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

function ExportButton({
  label,
  disabled = false,
  onClick,
}: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-between rounded-2xl bg-slate-200/40 p-4 transition-all hover:bg-slate-200/60 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      <div className="flex items-center gap-3 text-sm font-bold text-slate-700 group-disabled:text-slate-300">
        <Download size={16} /> {label}
      </div>
      <span className="text-slate-400 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0 group-disabled:text-slate-300">
        →
      </span>
    </button>
  );
}
