"use client";

import { startTransition, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Loader2, Upload } from "lucide-react";

type ProjectSubtitleUploadProps = {
  projectId: number | string;
  buttonLabel?: string;
  helperText?: string;
  redirectHref?: string;
  className?: string;
  onUploaded?: () => Promise<void> | void;
};

const ALLOWED_EXTENSIONS = ["srt", "vtt", "ass"];

function getUploadErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const error = data.error;

    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return "上传字幕失败，请稍后重试";
}

export default function ProjectSubtitleUpload({
  projectId,
  buttonLabel = "上传字幕",
  helperText,
  redirectHref,
  className,
  onUploaded,
}: ProjectSubtitleUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const openFilePicker = () => {
    if (uploading) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("仅支持 .srt、.vtt、.ass 格式");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getUploadErrorMessage(data));
      }

      if (onUploaded) {
        await onUploaded();
      }

      if (redirectHref) {
        startTransition(() => {
          router.push(redirectHref);
          router.refresh();
        });
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "上传字幕失败，请稍后重试",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".srt,.vtt,.ass"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={openFilePicker}
        disabled={uploading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none",
          className,
        )}
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            上传中...
          </>
        ) : (
          <>
            <Upload size={18} />
            {buttonLabel}
          </>
        )}
      </button>

      {helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
