import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { Overview } from "./overview.jsx";

const schemaRoot = {
  mind: {
    trunks: [],
    leaves: ["name"],
  },
  name: {
    trunks: ["mind"],
    leaves: [],
  },
};

describe("Overview", () => {
  test("no items", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const items = [];

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <Overview items={items} />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() =>
      getByText('press "new" in the top right corner to add entries'),
    ).not.toThrowError();
  });

  test("item", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    setStore("recordSet", ["mind"]);

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <Overview />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
