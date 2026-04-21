import Link from "next/link";
import { X } from "lucide-react";
import NewProjectWizard from "@/components/projects/NewProjectWizard";
import {
  getNewProjectPrefill,
  type NewProjectSearchParams,
} from "@/lib/new-project-prefill";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<NewProjectSearchParams>;
}) {
  const { autoCreateProject, initialProjectName } = getNewProjectPrefill(
    await searchParams,
  );
  const pageTitle = initialProjectName || "新建项目";

  return (
    <div className="min-h-full bg-[#F8F9FD] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-indigo-100 bg-white shadow-[0_28px_90px_-30px_rgba(79,70,229,0.28)]">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400" />
          <div className="flex items-start justify-between gap-4 border-b border-indigo-100/70 bg-[linear-gradient(90deg,rgba(238,242,255,0.92),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8 sm:py-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Create Project
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                独立访问时仍然保留完整创建流程，和弹框版本共用同一套逻辑。
              </p>
            </div>

            <Link
              href="/projects"
              aria-label="关闭页面"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-indigo-500 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <X size={22} />
            </Link>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <NewProjectWizard
              autoCreateProject={autoCreateProject}
              initialProjectName={initialProjectName}
              mode="page"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
