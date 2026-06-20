import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { MenuBase } from "./menu_base.jsx";

describe("MenuBase", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

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

    setStore("schema", schemaRoot);

    setStore("base", "mind");

    const { getByRole, getAllByRole } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore }}>
          <MenuBase />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(getByRole("option", { name: "mind" }).selected).toBe(true);

    expect(getAllByRole("option").length).toBe(3);

    await userEvent.selectOptions(
      getByRole("combobox"),
      getByRole("option", { name: "branch" }),
    );

    expect(getByRole("option", { name: "branch" }).selected).toBe(true);
  });
});
