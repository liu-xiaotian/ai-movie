"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Languages,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

type CreateProjectResponse = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  progress: number;
  currentStep: number;
};

export default function NewProjectPage() {
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
    targetLanguage: "中文 (简体)",
    aiEnhanced: true,
  });

  const steps = [
    { id: 1, title: "项目基本信息", icon: <FileText size={20} /> },
    { id: 2, title: "上传字幕源", icon: <Upload size={20} /> },
    { id: 3, title: "AI 配置", icon: <Sparkles size={20} /> },
  ];

  const languages = ["中文 (简体)", "英语", "日语", "韩语", "法语", "德语"];

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  // 第一步：创建项目
  const handleCreateProjectBase = async () => {
    if (!formData.projectName.trim()) return;

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "创建项目失败");
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

  // 第二步：上传字幕文件
  const handleUploadSubtitle = async () => {
    if (!projectId) {
      setError("项目尚未创建，请先完成第一步");
      return;
    }

    if (!selectedFile) {
      setError("请先选择一个字幕文件");
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    const allowExt = ["srt", "vtt", "ass"];

    if (!ext || !allowExt.includes(ext)) {
      setError("仅支持 .srt、.vtt、.ass 格式");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formDataObj = new FormData();
      formDataObj.append("file", selectedFile);

      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await res.json();

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

  // 第三步：完成创建
  const handleFinishProject = async () => {
    if (!projectId) {
      setError("缺少项目 ID");
      return;
    }

    try {
      setFinishing(true);
      setError("");

      // 这里调用更新项目配置接口
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

      const data = await res.json();

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
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col p-12 lg:p-24 text-slate-800">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            新建项目
          </h1>
          <p className="text-slate-400 font-medium">
            开始您的 AI 驱动字幕翻译之旅
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="flex flex-col gap-10 shrink-0">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-5">
                <div
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${
                      activeStep === step.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                        : activeStep > step.id
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                          : "bg-white text-slate-300 border border-slate-100"
                    }
                  `}
                >
                  {activeStep > step.id ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      activeStep >= step.id
                        ? "text-indigo-600"
                        : "text-slate-300"
                    }`}
                  >
                    步骤 {step.id}
                  </p>
                  <p
                    className={`font-bold transition-colors ${
                      activeStep >= step.id
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 w-full">
            <div className="bg-[#EDF2F7]/50 border border-white/60 rounded-[40px] p-10 lg:p-14 shadow-sm min-h-[450px] flex flex-col justify-center transition-all">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Step 1 */}
              {activeStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      项目名称
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectName: e.target.value,
                        })
                      }
                      placeholder="例如：星际穿越 字幕翻译"
                      className="w-full bg-white border-none rounded-2xl py-5 px-8 text-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <button
                    disabled={!formData.projectName.trim() || loading}
                    onClick={handleCreateProjectBase}
                    className="w-full bg-indigo-600 disabled:bg-indigo-300 text-white py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group"
                  >
                    {loading ? "创建中..." : "下一步"}
                    {!loading && (
                      <ArrowRight
                        size={22}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    )}
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {activeStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 bg-white/50 text-center">
                    <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="font-bold text-slate-600 mb-2">
                      点击选择字幕文件
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      支持 .srt, .vtt, .ass 格式
                    </p>

                    <input
                      type="file"
                      accept=".srt,.vtt,.ass"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:rounded-xl file:border-0
                        file:bg-indigo-50 file:px-4 file:py-2
                        file:font-medium file:text-indigo-600
                        hover:file:bg-indigo-100"
                    />

                    {selectedFile && (
                      <div className="mt-4 text-sm text-slate-600">
                        已选择：
                        <span className="font-semibold">
                          {selectedFile.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      disabled={uploading}
                      className="flex-1 bg-white border border-slate-100 py-5 rounded-3xl font-bold text-slate-400"
                    >
                      返回
                    </button>

                    <button
                      onClick={handleUploadSubtitle}
                      disabled={!selectedFile || uploading}
                      className="flex-[2] bg-indigo-600 disabled:bg-indigo-300 text-white py-5 rounded-3xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                    >
                      {uploading ? "上传中..." : "确认上传"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {activeStep === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 ml-1">
                      <Languages size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        目标语言
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() =>
                            setFormData({ ...formData, targetLanguage: lang })
                          }
                          className={`py-4 rounded-2xl font-bold text-sm transition-all border-2
                            ${
                              formData.targetLanguage === lang
                                ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm"
                                : "bg-white border-transparent text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section
                    className={`p-8 rounded-[32px] border-2 transition-all ${
                      formData.aiEnhanced
                        ? "bg-indigo-50/50 border-indigo-100"
                        : "bg-slate-100/50 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Sparkles
                          size={20}
                          fill={formData.aiEnhanced ? "currentColor" : "none"}
                        />
                        <span className="font-bold text-sm">AI 增强翻译</span>
                      </div>

                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            aiEnhanced: !formData.aiEnhanced,
                          })
                        }
                        className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${
                          formData.aiEnhanced ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                            formData.aiEnhanced ? "left-8" : "left-1"
                          }`}
                        />
                      </div>
                    </div>

                    <p
                      className={`text-sm leading-relaxed ${
                        formData.aiEnhanced
                          ? "text-indigo-900/60"
                          : "text-slate-400"
                      }`}
                    >
                      启用后，AI
                      将自动识别语境、俚语和专业术语，提供更自然的翻译建议。
                    </p>
                  </section>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      disabled={finishing}
                      className="flex-1 bg-white border border-slate-100 text-slate-500 py-5 rounded-3xl font-bold text-xl hover:bg-slate-50 transition-all"
                    >
                      返回
                    </button>

                    <button
                      onClick={handleFinishProject}
                      disabled={finishing}
                      className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group"
                    >
                      {finishing ? "提交中..." : "创建项目"}
                      {!finishing && (
                        <Sparkles
                          size={22}
                          className="group-hover:rotate-12 transition-transform"
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
