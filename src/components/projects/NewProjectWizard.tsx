"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Languages,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

type CreateProjectResponse = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  progress: number;
  currentStep: number;
};

type WizardMode = "page" | "modal";

type NewProjectWizardProps = {
  autoCreateProject?: boolean;
  initialProjectName?: string;
  mode?: WizardMode;
};

const steps = [
  {
    id: 1,
    title: "项目信息",
    description: "先创建项目基础记录",
    icon: FileText,
  },
  {
    id: 2,
    title: "上传字幕",
    description: "导入字幕源文件",
    icon: Upload,
  },
  {
    id: 3,
    title: "AI 配置",
    description: "设置语言与增强翻译",
    icon: Sparkles,
  },
] as const;

const languages = [
  "中文（简体）",
  "英语",
  "日语",
  "韩语",
  "法语",
  "德语",
];

function getErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  const message = data.error;
  return typeof message === "string" ? message : undefined;
}

export default function NewProjectWizard({
  autoCreateProject = false,
  initialProjectName = "",
  mode = "page",
}: NewProjectWizardProps) {
  const router = useRouter();
  const isCompact = mode === "modal";
  const autoCreateTriggeredRef = useRef(false);

  const [activeStep, setActiveStep] = useState(1);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    projectName: initialProjectName.trim(),
    targetLanguage: "中文（简体）",
    aiEnhanced: true,
  });

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const createProjectBase = async (projectName: string) => {
    const trimmedProjectName = projectName.trim();

    if (!trimmedProjectName) {
      return;
    }

    if (projectId) {
      setError("");
      setActiveStep(2);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedProjectName,
          description: "",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | CreateProjectResponse
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "创建项目失败");
      }

      const project = data as CreateProjectResponse;
      setProjectId(project.id);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建项目失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProjectBase = async () => {
    await createProjectBase(formData.projectName);
  };

  useEffect(() => {
    if (!autoCreateProject || projectId || autoCreateTriggeredRef.current) {
      return;
    }

    const trimmedProjectName = initialProjectName.trim();
    if (!trimmedProjectName) {
      return;
    }

    autoCreateTriggeredRef.current = true;
    void createProjectBase(trimmedProjectName);
  }, [autoCreateProject, initialProjectName, projectId]);

  const handleUploadSubtitle = async () => {
    if (!projectId) {
      setError("项目尚未创建，请先完成第一步。");
      return;
    }

    if (!selectedFile) {
      setError("请先选择一个字幕文件。");
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    const allowExt = ["srt", "vtt", "ass"];

    if (!ext || !allowExt.includes(ext)) {
      setError("仅支持 .srt、.vtt、.ass 格式。");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const payload = new FormData();
      payload.append("file", selectedFile);

      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: payload,
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.error || "上传失败");
      }

      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleFinishProject = async () => {
    if (!projectId) {
      setError("缺少项目 ID。");
      return;
    }

    try {
      setFinishing(true);
      setError("");

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetLanguage: formData.targetLanguage,
          aiEnhanced: formData.aiEnhanced,
          status: "IN_PROGRESS",
          progress: 100,
          currentStep: 3,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.error || "保存项目配置失败");
      }

      startTransition(() => {
        router.replace("/projects");
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存项目配置失败");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {error ? (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm shadow-red-100/60">
          {error}
        </div>
      ) : null}

      <div
        className={clsx(
          "grid gap-5",
          isCompact
            ? "lg:grid-cols-[210px_minmax(0,1fr)]"
            : "lg:grid-cols-[250px_minmax(0,1fr)]",
        )}
      >
        <ol className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id;

            return (
              <li
                key={step.id}
                className={clsx(
                  "rounded-[22px] border transition-all duration-300",
                  isCompact ? "px-3.5 py-3.5" : "px-4 py-4",
                  isActive
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white shadow-lg shadow-indigo-100/50"
                    : isDone
                      ? "border-indigo-100 bg-white shadow-sm shadow-indigo-100/30"
                      : "border-transparent bg-white/65",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "flex shrink-0 items-center justify-center rounded-2xl transition-all",
                      isCompact ? "h-9 w-9" : "h-10 w-10",
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : isDone
                          ? "bg-indigo-500 text-white shadow-sm shadow-indigo-100"
                          : "border border-indigo-100 bg-indigo-50 text-indigo-300",
                    )}
                  >
                    {isDone ? (
                      <Check size={18} strokeWidth={2.4} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={clsx(
                        "text-[11px] font-semibold uppercase tracking-[0.22em]",
                        isActive || isDone
                          ? "text-indigo-500"
                          : "text-slate-400",
                      )}
                    >
                      Step {step.id}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p
                      className={clsx(
                        "mt-1 text-slate-500",
                        isCompact ? "text-[13px] leading-5" : "text-sm leading-6",
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          className={clsx(
            "relative flex min-h-[400px] flex-col overflow-hidden rounded-[28px] border border-indigo-100/80 bg-[linear-gradient(180deg,rgba(238,242,255,0.92),rgba(255,255,255,0.98))] shadow-[0_24px_80px_-42px_rgba(79,70,229,0.38)]",
            isCompact ? "p-5 sm:p-6 lg:min-h-[440px]" : "p-6 sm:p-8 lg:min-h-[560px]",
          )}
        >
          <div
            className={clsx(
              "pointer-events-none absolute right-0 top-0 translate-x-8 -translate-y-8 rounded-full bg-indigo-200/50 blur-3xl",
              isCompact ? "h-28 w-28" : "h-36 w-36",
            )}
          />
          <div
            className={clsx(
              "pointer-events-none absolute bottom-0 left-0 -translate-x-8 translate-y-8 rounded-full bg-violet-200/35 blur-3xl",
              isCompact ? "h-24 w-24" : "h-32 w-32",
            )}
          />
          <div className="relative flex h-full flex-col">
          {activeStep === 1 ? (
            <StepOne
              compact={isCompact}
              loading={loading}
              projectName={formData.projectName}
              onProjectNameChange={(projectName) =>
                setFormData((prev) => ({
                  ...prev,
                  projectName,
                }))
              }
              onSubmit={handleCreateProjectBase}
            />
          ) : null}

          {activeStep === 2 ? (
            <StepTwo
              compact={isCompact}
              uploading={uploading}
              selectedFile={selectedFile}
              onBack={handleBack}
              onFileChange={setSelectedFile}
              onSubmit={handleUploadSubtitle}
            />
          ) : null}

          {activeStep === 3 ? (
            <StepThree
              compact={isCompact}
              aiEnhanced={formData.aiEnhanced}
              finishing={finishing}
              projectName={formData.projectName}
              selectedFile={selectedFile}
              targetLanguage={formData.targetLanguage}
              onBack={handleBack}
              onFinish={handleFinishProject}
              onTargetLanguageChange={(targetLanguage) =>
                setFormData((prev) => ({
                  ...prev,
                  targetLanguage,
                }))
              }
              onToggleAi={() =>
                setFormData((prev) => ({
                  ...prev,
                  aiEnhanced: !prev.aiEnhanced,
                }))
              }
            />
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type StepOneProps = {
  compact: boolean;
  loading: boolean;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  onSubmit: () => void;
};

function StepOne({
  compact,
  loading,
  projectName,
  onProjectNameChange,
  onSubmit,
}: StepOneProps) {
  return (
    <section className="flex h-full flex-col">
      <div>
        <p
          className={clsx(
            "font-semibold uppercase tracking-[0.2em] text-indigo-500",
            compact ? "text-[12px]" : "text-sm",
          )}
        >
          Step 1
        </p>
        <h2
          className={clsx(
            "mt-2 font-semibold tracking-tight text-slate-900",
            compact ? "text-[28px]" : "text-3xl",
          )}
        >
          先给项目起个名字
        </h2>
        <p
          className={clsx(
            "mt-3 max-w-2xl text-sm text-slate-500",
            compact ? "leading-6" : "leading-7",
          )}
        >
          这个名称会出现在项目列表里，用来区分不同字幕翻译任务。
        </p>
      </div>

      <div className={clsx(compact ? "mt-7" : "mt-10")}>
        <label
          htmlFor="project-name"
          className="mb-3 block text-sm font-medium text-indigo-600"
        >
          项目名称
        </label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="例如：星际穿越 字幕翻译"
          className={clsx(
            "w-full rounded-[22px] border border-indigo-100 bg-white text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
            compact ? "px-4 py-3.5 text-base" : "px-5 py-4 text-lg",
          )}
        />
      </div>

      <div className={clsx("mt-auto flex justify-end", compact ? "pt-6" : "pt-8")}>
        <button
          type="button"
          disabled={!projectName.trim() || loading}
          onClick={onSubmit}
          className={clsx(
            "inline-flex items-center gap-2 rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none",
            compact ? "px-4 py-3" : "px-5 py-3.5",
          )}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              创建中...
            </>
          ) : (
            <>
              创建项目并继续
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

type StepTwoProps = {
  compact: boolean;
  uploading: boolean;
  selectedFile: File | null;
  onBack: () => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
};

function StepTwo({
  compact,
  uploading,
  selectedFile,
  onBack,
  onFileChange,
  onSubmit,
}: StepTwoProps) {
  return (
    <section className="flex h-full flex-col">
      <div>
        <p
          className={clsx(
            "font-semibold uppercase tracking-[0.2em] text-indigo-500",
            compact ? "text-[12px]" : "text-sm",
          )}
        >
          Step 2
        </p>
        <h2
          className={clsx(
            "mt-2 font-semibold tracking-tight text-slate-900",
            compact ? "text-[28px]" : "text-3xl",
          )}
        >
          上传字幕源文件
        </h2>
        <p
          className={clsx(
            "mt-3 max-w-2xl text-sm text-slate-500",
            compact ? "leading-6" : "leading-7",
          )}
        >
          支持 `.srt`、`.vtt`、`.ass` 三种格式，上传后会进入下一步配置。
        </p>
      </div>

      <div
        className={clsx(
          "mt-10 flex-1 rounded-[28px] border border-dashed border-indigo-200 bg-white/90",
          compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              "flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600",
              compact ? "h-12 w-12" : "h-14 w-14",
            )}
          >
            <Upload size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">选择字幕文件</p>
            <p className="mt-1 text-sm text-slate-500">
              上传后会保留原有流程，不改变现有接口和处理步骤。
            </p>
          </div>
        </div>

        <div className={clsx("rounded-[22px] border border-indigo-100 bg-indigo-50/45 p-4", compact ? "mt-6" : "mt-8")}>
          <label
            htmlFor="subtitle-file"
            className="mb-3 block text-sm font-medium text-indigo-600"
          >
            字幕文件
          </label>
          <input
            id="subtitle-file"
            type="file"
            accept=".srt,.vtt,.ass"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2.5 file:font-medium file:text-white hover:file:bg-indigo-700"
          />
        </div>

        {selectedFile ? (
          <div className="mt-5 rounded-[22px] border border-indigo-100 bg-indigo-50/80 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  文件已选中，确认后会上传到当前项目。
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={clsx("flex flex-col gap-3 sm:flex-row sm:justify-end", compact ? "mt-6" : "mt-8")}>
        <button
          type="button"
          onClick={onBack}
          disabled={uploading}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60",
            compact ? "px-4 py-3" : "px-5 py-3.5",
          )}
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!selectedFile || uploading}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none",
            compact ? "px-4 py-3" : "px-5 py-3.5",
          )}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              上传中...
            </>
          ) : (
            <>
              上传并继续
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

type StepThreeProps = {
  compact: boolean;
  aiEnhanced: boolean;
  finishing: boolean;
  projectName: string;
  selectedFile: File | null;
  targetLanguage: string;
  onBack: () => void;
  onFinish: () => void;
  onTargetLanguageChange: (language: string) => void;
  onToggleAi: () => void;
};

function StepThree({
  compact,
  aiEnhanced,
  finishing,
  projectName,
  selectedFile,
  targetLanguage,
  onBack,
  onFinish,
  onTargetLanguageChange,
  onToggleAi,
}: StepThreeProps) {
  return (
    <section className="flex h-full flex-col">
      <div>
        <p
          className={clsx(
            "font-semibold uppercase tracking-[0.2em] text-indigo-500",
            compact ? "text-[12px]" : "text-sm",
          )}
        >
          Step 3
        </p>
        <h2
          className={clsx(
            "mt-2 font-semibold tracking-tight text-slate-900",
            compact ? "text-[28px]" : "text-3xl",
          )}
        >
          完成 AI 翻译配置
        </h2>
        <p
          className={clsx(
            "mt-3 max-w-2xl text-sm text-slate-500",
            compact ? "leading-6" : "leading-7",
          )}
        >
          选择目标语言，并决定是否开启 AI 增强翻译，确认后项目就会进入处理流程。
        </p>
      </div>

      <div className={clsx("grid gap-3 sm:grid-cols-2", compact ? "mt-6" : "mt-8")}>
        <SummaryCard label="项目名称" value={projectName || "未命名项目"} />
        <SummaryCard
          label="字幕文件"
          value={selectedFile?.name || "尚未选择文件"}
        />
      </div>

      <div className={clsx(compact ? "mt-6" : "mt-8")}>
        <div className="mb-3 flex items-center gap-2 text-indigo-600">
          <Languages size={16} />
          <span className="text-sm font-medium">目标语言</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {languages.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => onTargetLanguageChange(language)}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                targetLanguage === language
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "border-indigo-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50",
              )}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleAi}
        aria-pressed={aiEnhanced}
        className={clsx(
          "flex items-center justify-between gap-4 rounded-[24px] border px-5 text-left transition",
          compact ? "mt-6 py-4" : "mt-8 py-5",
          aiEnhanced
            ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-sm shadow-indigo-100/40"
            : "border-indigo-100 bg-white",
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className={aiEnhanced ? "text-indigo-600" : "text-slate-400"}
            />
            <span className="text-base font-semibold text-slate-900">
              AI 增强翻译
            </span>
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            开启后会结合上下文和语境，生成更自然的字幕翻译建议。
          </p>
        </div>

        <span
          className={clsx(
            "relative inline-flex h-7 w-12 shrink-0 rounded-full transition",
            aiEnhanced ? "bg-indigo-600" : "bg-slate-300",
          )}
        >
          <span
            className={clsx(
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
              aiEnhanced ? "left-6" : "left-1",
            )}
          />
        </span>
      </button>

      <div className={clsx("mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end", compact ? "pt-6" : "pt-8")}>
        <button
          type="button"
          onClick={onBack}
          disabled={finishing}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60",
            compact ? "px-4 py-3" : "px-5 py-3.5",
          )}
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={finishing}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none",
            compact ? "px-4 py-3" : "px-5 py-3.5",
          )}
        >
          {finishing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              提交中...
            </>
          ) : (
            <>
              创建项目
              <Sparkles size={16} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-[22px] border border-indigo-100 bg-white/85 px-4 py-4 shadow-sm shadow-indigo-100/20">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
