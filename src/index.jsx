/* @refresh reload */
import { render } from "solid-js/web";
import { I18nProvider } from "@lingui/solid";
import { i18n, detectLocale, loadCatalog } from "@/i18n.js";
import { Context, makeStore, openBook, searchBook } from "@/store/store.js";
import { polyfill } from "@/polyfill.js";
import App from "@/layout/layout.jsx";
import "@/index.css";
import "@/style/theme.css";

polyfill();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

async function bindBook(context, element) {
  const detected = detectLocale();
  if (detected !== "en") {
    await loadCatalog(detected, i18n);
  }
  render(
    () => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={context}>
          <App />
        </Context.Provider>
      </I18nProvider>
    ),
    element,
  );
}

export function create(api) {
  const [store, setStore] = makeStore();

  return {
    open: (content) => openBook({ setStore }, content),
    bind: (element) => bindBook({ store, setStore, api }, element),
    find: (base, query) => searchBook({ store, setStore, api }, base, query),
  };
}

export default { create };
