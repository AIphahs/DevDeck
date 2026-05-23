import { useLocaleStore } from "@/store/localeStore";
import { translations } from "@/i18n/translations";

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return translations[locale];
}
