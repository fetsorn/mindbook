import { setupI18n } from "@lingui/core";
import { messages as enMessages } from "./locales/en.po";

export const locales = {
  zh: "中文",
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  bn: "বাংলা",
  pt: "Português",
  ru: "Русский",
};

const rtlLocales = new Set(["ar"]);

export function detectLocale() {
  const langs = navigator.languages ?? [navigator.language ?? "en"];
  for (const tag of langs) {
    const prefix = tag.split("-")[0].toLowerCase();
    if (prefix in locales) return prefix;
  }
  return "en";
}

export async function loadCatalog(locale, i18n) {
  const catalog = await import(`./locales/${locale}.po`);
  i18n.loadAndActivate({ locale, messages: catalog.messages });
  if (typeof document !== "undefined") {
    document.documentElement.dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  }
}

export const i18n = setupI18n();
i18n.loadAndActivate({ locale: "en", messages: enMessages });
