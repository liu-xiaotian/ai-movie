"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";

const OPTIONS: Array<{ icon: typeof Sun; label: string; value: Theme }> = [
  { icon: Sun, label: "浅色", value: "light" },
  { icon: Moon, label: "深色", value: "dark" },
];

export default function ThemeSwitcher() {
  const { isReady, theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-xl border border-[color:var(--border-strong)] bg-[var(--icon-surface)] p-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = isReady && theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={`切换到${option.label}主题`}
            aria-pressed={isActive}
            onClick={() => {
              setTheme(option.value);
            }}
            className={`rounded-lg p-1.5 transition-all ${
              isActive
                ? "bg-[var(--surface-strong)] text-[var(--text-medium)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-medium)]"
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
