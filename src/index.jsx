/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./layout/layout.jsx";
import { polyfill } from "./polyfill.js";
import { ApiProvider } from "./context.js";

polyfill();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

export default function mindbook(provider) {
  render(
    () => (
      <ApiProvider value={provider}>
        <App />
      </ApiProvider>
    ),
    document.getElementById("root"),
  );
}
