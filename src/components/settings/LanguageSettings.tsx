import { useLocaleStore } from "@/store/localeStore";
import { useT } from "@/hooks/useT";
import { cn } from "@/utils/cn";
import type { Locale } from "@/i18n/translations";

const LANGUAGES: { value: Locale; label: string; flag: string; native: string }[] = [
  { value: "fr", label: "Français", flag: "🇫🇷", native: "Français" },
  { value: "en", label: "English", flag: "🇬🇧", native: "English" },
];

export function LanguageSettings() {
  const { locale, setLocale } = useLocaleStore();
  const t = useT();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-medium">{t.language.title}</h2>
        <p className="text-sm text-muted-foreground">{t.language.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            onClick={() => setLocale(lang.value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
              locale === lang.value
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-accent"
            )}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div>
              <p className={cn("font-medium text-sm", locale === lang.value && "text-primary")}>
                {lang.native}
              </p>
              <p className="text-xs text-muted-foreground">{lang.label}</p>
            </div>
            {locale === lang.value && (
              <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
