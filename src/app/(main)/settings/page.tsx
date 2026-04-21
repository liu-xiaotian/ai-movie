import {
  Globe,
  Moon,
  Sparkles,
  Languages,
  CheckCircle2,
  Download,
  Bell,
  Shield,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen bg-[var(--app-bg)] px-12 py-10 pb-28 text-[var(--text-strong)] transition-colors">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <h1 className="mb-2 text-4xl font-bold text-[var(--text-strong)]">
            设置
          </h1>
          <p className="font-medium text-[var(--text-muted)]">
            自定义你的翻译体验和偏好设置。
          </p>
        </header>

        <div className="space-y-10">
          <section>
            <SectionTitle>常规</SectionTitle>
            <SettingsCard>
              <SettingRow
                icon={Globe}
                title="界面语言"
                desc="选择你偏好的应用语言"
                action={
                  <span className="cursor-pointer text-sm font-bold text-brand">
                    简体中文
                  </span>
                }
              />
              <SettingRow
                icon={Moon}
                title="外观模式"
                desc="切换浅色或深色主题"
                isLast
                action={<ThemeSwitcher />}
              />
            </SettingsCard>
          </section>

          <section>
            <SectionTitle>AI 翻译</SectionTitle>
            <SettingsCard>
              <SettingRow
                icon={Sparkles}
                title="默认翻译模型"
                desc="选择用于字幕翻译的 AI 模型"
                action={
                  <span className="cursor-pointer text-sm font-bold text-brand">
                    Gemini 1.5 Pro
                  </span>
                }
              />
              <SettingRow
                icon={Languages}
                title="翻译风格"
                desc="设置默认的翻译语气和风格"
                action={
                  <span className="text-sm font-bold text-[var(--text-medium)]">
                    自然 / 现代
                  </span>
                }
              />
              <SettingRow
                icon={CheckCircle2}
                title="自动术语库"
                desc="自动识别并应用项目术语库"
                isLast
                action={<Switch active />}
              />
            </SettingsCard>
          </section>

          <section>
            <SectionTitle>导出与通知</SectionTitle>
            <SettingsCard>
              <SettingRow
                icon={Download}
                title="默认导出格式"
                desc="设置下载字幕时的首选格式"
                action={
                  <span className="text-sm font-bold text-[var(--text-medium)]">
                    .SRT
                  </span>
                }
              />
              <SettingRow
                icon={Bell}
                title="通知设置"
                desc="管理翻译完成或系统提醒"
                isLast
                action={
                  <ChevronRight
                    size={18}
                    className="text-[var(--text-muted)]"
                  />
                }
              />
            </SettingsCard>
          </section>

          <section>
            <SectionTitle>安全</SectionTitle>
            <SettingsCard>
              <SettingRow
                icon={Shield}
                title="隐私设置"
                desc="管理你的数据和隐私偏好"
                isLast
                action={
                  <ChevronRight
                    size={18}
                    className="text-[var(--text-muted)]"
                  />
                }
              />
            </SettingsCard>
          </section>

          <div className="mx-auto flex max-w-4xl items-center justify-end gap-6">
            <button className="font-bold text-[var(--text-medium)] transition-colors hover:text-[var(--text-strong)]">
              取消
            </button>
            <button className="rounded-2xl bg-brand px-10 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:opacity-90">
              保存更改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 ml-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
      {children}
    </h3>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[color:var(--border-soft)] bg-[var(--surface-muted)] transition-colors">
      {children}
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  action,
  isLast,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  action: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`group flex items-center justify-between p-6 transition-colors hover:bg-[var(--surface-hover)] ${
        !isLast ? "border-b border-[color:var(--border-soft)]" : ""
      }`}
    >
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--icon-surface)] text-[var(--text-medium)] shadow-sm transition-all group-hover:bg-[var(--surface-strong)] group-hover:text-brand">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-bold text-[var(--text-strong)]">{title}</h4>
          <p className="text-xs font-medium text-[var(--text-muted)]">
            {desc}
          </p>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function Switch({ active }: { active?: boolean }) {
  return (
    <div
      className={`relative h-6 w-12 cursor-pointer rounded-full transition-all duration-300 ${
        active ? "bg-brand" : "bg-[var(--border-strong)]"
      }`}
    >
      <div
        className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--surface-strong)] transition-all duration-300 ${
          active ? "left-7" : "left-1"
        }`}
      />
    </div>
  );
}
