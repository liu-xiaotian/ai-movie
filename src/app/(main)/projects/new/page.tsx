"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Languages,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();

  // --- 状态管理 ---
  const [activeStep, setActiveStep] = useState(1);
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

  // --- 处理函数 ---
  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const handleCreate = () => {
    console.log("提交数据:", formData);
    // 模拟创建成功后跳转回项目列表
    router.push("/projects");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col p-12 lg:p-24 text-slate-800">
      <div className="max-w-5xl mx-auto w-full">
        {/* --- Header --- */}
        <header className="mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            新建项目
          </h1>
          <p className="text-slate-400 font-medium">
            开始您的 AI 驱动字幕翻译之旅
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* --- Left: Stepper --- */}
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
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" // 已完成状态
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
                    className={`text-[10px] font-bold uppercase tracking-widest ${activeStep >= step.id ? "text-indigo-600" : "text-slate-300"}`}
                  >
                    步骤 {step.id}
                  </p>
                  <p
                    className={`font-bold transition-colors ${activeStep >= step.id ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* --- Right: Dynamic Form Card --- */}
          <div className="flex-1 w-full">
            <div className="bg-[#EDF2F7]/50 border border-white/60 rounded-[40px] p-10 lg:p-14 shadow-sm min-h-[450px] flex flex-col justify-center transition-all">
              {/* Step 1: 基本信息 */}
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
                    disabled={!formData.projectName}
                    onClick={handleNext}
                    className="w-full bg-indigo-600 disabled:bg-indigo-300 text-white py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group"
                  >
                    下一步{" "}
                    <ArrowRight
                      size={22}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              )}

              {/* Step 2: 上传 (简化版展示) */}
              {activeStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 bg-white/50 text-center">
                    <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="font-bold text-slate-600">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      支持 .srt, .vtt, .ass 格式
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-white border border-slate-100 py-5 rounded-3xl font-bold text-slate-400"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                    >
                      确认上传
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: AI 配置 (核心分支) */}
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
                    className={`p-8 rounded-[32px] border-2 transition-all ${formData.aiEnhanced ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-100/50 border-transparent"}`}
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
                        className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${formData.aiEnhanced ? "bg-indigo-600" : "bg-slate-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.aiEnhanced ? "left-8" : "left-1"}`}
                        />
                      </div>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${formData.aiEnhanced ? "text-indigo-900/60" : "text-slate-400"}`}
                    >
                      启用后，AI
                      将自动识别语境、俚语和专业术语，提供更自然的翻译建议。
                    </p>
                  </section>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-white border border-slate-100 text-slate-500 py-5 rounded-3xl font-bold text-xl hover:bg-slate-50 transition-all"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleCreate}
                      className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group"
                    >
                      创建项目{" "}
                      <Sparkles
                        size={22}
                        className="group-hover:rotate-12 transition-transform"
                      />
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
