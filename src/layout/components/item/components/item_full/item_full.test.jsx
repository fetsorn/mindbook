import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { ItemFull } from "./item_full.jsx";

describe("ItemFull", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

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

    setStore("schema", schemaRoot);

    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <ItemFull item={record} index={index} />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
