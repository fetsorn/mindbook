import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { Item } from "./item.jsx";

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

describe("Item", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <Item item={"mind"} index={index} />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
