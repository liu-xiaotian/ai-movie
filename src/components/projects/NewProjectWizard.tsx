"use client";

import { useState } from "react";
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
  mode = "page",
}: NewProjectWizardProps) {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    targetLanguage: "中文（简体）",
    aiEnhanced: true,
  });

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateProjectBase = async () => {
    if (!formData.projectName.trim()) {
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
          title: formData.projectName.trim(),
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
          status: "PROCESSING",
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

      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存项目配置失败");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {error ? (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ol className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id;

            return (
              <li
                key={step.id}
                className={clsx(
                  "rounded-[24px] border px-4 py-4 transition-all",
                  isActive
                    ? "border-slate-200 bg-white shadow-sm"
                    : isDone
                      ? "border-emerald-100 bg-emerald-50/70"
                      : "border-transparent bg-slate-50/80",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      isActive
                        ? "bg-slate-900 text-white"
                        : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-slate-400",
                    )}
                  >
                    {isDone ? <Check size={18} strokeWidth={2.4} /> : <Icon size={18} />}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={clsx(
                        "text-[11px] font-semibold uppercase tracking-[0.22em]",
                        isActive || isDone ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      Step {step.id}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
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
            "flex min-h-[460px] flex-col rounded-[28px] border border-slate-100 bg-slate-50/70 p-6 sm:p-8",
            mode === "modal" ? "lg:min-h-[520px]" : "lg:min-h-[560px]",
          )}
        >
          {activeStep === 1 ? (
            <StepOne
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
              uploading={uploading}
              selectedFile={selectedFile}
              onBack={handleBack}
              onFileChange={setSelectedFile}
              onSubmit={handleUploadSubtitle}
            />
          ) : null}

          {activeStep === 3 ? (
            <StepThree
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
  );
}

type StepOneProps = {
  loading: boolean;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  onSubmit: () => void;
};

function StepOne({
  loading,
  projectName,
  onProjectNameChange,
  onSubmit,
}: StepOneProps) {
  return (
    <section className="flex h-full flex-col">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Step 1
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          先给项目起个名字
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          这个名称会出现在项目列表里，用来区分不同字幕翻译任务。
        </p>
      </div>

      <div className="mt-10">
        <label
          htmlFor="project-name"
          className="mb-3 block text-sm font-medium text-slate-500"
        >
          项目名称
        </label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="例如：星际穿越 字幕翻译"
          className="w-full rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-slate-900"
        />
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <button
          type="button"
          disabled={!projectName.trim() || loading}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
  uploading: boolean;
  selectedFile: File | null;
  onBack: () => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
};

function StepTwo({
  uploading,
  selectedFile,
  onBack,
  onFileChange,
  onSubmit,
}: StepTwoProps) {
  return (
    <section className="flex h-full flex-col">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Step 2
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          上传字幕源文件
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          支持 `.srt`、`.vtt`、`.ass` 三种格式，上传后会进入下一步配置。
        </p>
      </div>

      <div className="mt-10 flex-1 rounded-[28px] border border-dashed border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Upload size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">选择字幕文件</p>
            <p className="mt-1 text-sm text-slate-500">
              上传后会保留原有流程，不改变现有接口和处理步骤。
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
          <label
            htmlFor="subtitle-file"
            className="mb-3 block text-sm font-medium text-slate-500"
          >
            字幕文件
          </label>
          <input
            id="subtitle-file"
            type="file"
            accept=".srt,.vtt,.ass"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:font-medium file:text-white hover:file:bg-slate-800"
          />
        </div>

        {selectedFile ? (
          <div className="mt-5 rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!selectedFile || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Step 3
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          完成 AI 翻译配置
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          选择目标语言，并决定是否开启 AI 增强翻译，确认后项目就会进入处理流程。
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <SummaryCard label="项目名称" value={projectName || "未命名项目"} />
        <SummaryCard
          label="字幕文件"
          value={selectedFile?.name || "尚未选择文件"}
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-slate-500">
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
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
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
          "mt-8 flex items-center justify-between gap-4 rounded-[24px] border px-5 py-5 text-left transition",
          aiEnhanced
            ? "border-amber-200 bg-amber-50"
            : "border-slate-200 bg-white",
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className={aiEnhanced ? "text-amber-600" : "text-slate-400"}
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
            aiEnhanced ? "bg-slate-900" : "bg-slate-300",
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

      <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={finishing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={finishing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
