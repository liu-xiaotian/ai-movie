import Link from "next/link";
import { X } from "lucide-react";
import NewProjectWizard from "@/components/projects/NewProjectWizard";

export default function NewProjectPage() {
  return (
    <div className="min-h-full bg-[#F8F9FD] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-28px_rgba(15,23,42,0.28)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                新建项目
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                独立访问时仍然保留完整创建流程，和弹框版本共用同一套逻辑。
              </p>
            </div>

            <Link
              href="/projects"
              aria-label="关闭页面"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={22} />
            </Link>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <NewProjectWizard mode="page" />
          </div>
        </div>
      </div>
    </div>
  );
}
