/* @refresh reload */
import { render } from "solid-js/web";
import crud from "@/proxy/index.js";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore } from "@/proxy/store.js";
import { ApiProvider } from "./context.js";
import { polyfill } from "./polyfill.js";
import App from "./layout/layout.jsx";
import "./index.css";

polyfill();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

export default async function mindbook(provider) {
  const api = await crud(provider);

  render(
    () => (
      <ApiProvider value={api}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <App />
        </QueryContext.Provider>
      </ApiProvider>
    ),
    document.getElementById("root"),
  );
}
