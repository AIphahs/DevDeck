import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";
import { Monitor, Moon, Sun } from "lucide-react";

const THEMES = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

const ACCENT_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Emerald", value: "#10b981" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Red", value: "#ef4444" },
];

export function ThemeSettings() {
  const { theme, accentColor, setTheme, setAccentColor } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Theme mode */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Appearance</Label>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                theme === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Accent color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setAccentColor(c.value)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                accentColor === c.value ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-mono">{accentColor}</span>
        </p>
      </div>
    </div>
  );
}
