import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { OverviewValue } from "./overview_value.jsx";

const schemaRoot = {
  mind: {
    trunks: [],
    leaves: ["name", "branch"],
  },
  name: {
    trunks: ["mind"],
    leaves: [],
  },
  branch: {
    trunks: ["mind"],
    leaves: [],
  },
};

describe("OverviewValue", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const branch = "mind";

    const value = "mind";

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <OverviewValue value={value} branch={branch} />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
