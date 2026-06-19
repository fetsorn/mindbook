import { setupI18n } from "@lingui/core";

export const locales = {
  en: "English",
  ar: "العربية",
};

export async function loadCatalog(locale, i18n) {
  const catalog = await import(`./locales/${locale}.po`);
  i18n.loadAndActivate({ locale, messages: catalog.messages });
}

export const i18n = setupI18n();
await loadCatalog("en", i18n);
