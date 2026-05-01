/* @refresh reload */
import { render } from "solid-js/web";
import { Context, makeStore, openBook } from "@/store/store.js";
import { polyfill } from "@/polyfill.js";
import App from "@/layout/layout.jsx";
import "@/index.css";

polyfill();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

function bindBook(context, element) {
  render(
    () => (
      <Context.Provider value={context}>
        <App />
      </Context.Provider>
    ),
    element,
  );
}

export function create(api) {
  const [store, setStore] = makeStore();

  return {
    open: (content) => openBook({ setStore }, content),
    bind: (element) => bindBook({ store, setStore, api }, element),
  };
}

export default { create };
