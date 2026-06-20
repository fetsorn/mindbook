import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { MenuSortQuery } from "./menu_sort_query.jsx";

describe("MenuSortQuery", () => {
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

    setStore("base", "mind");

    setStore("sortBy", "mind");

    const { getByRole, getAllByRole } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore }}>
          <MenuSortQuery />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(getByRole("option", { name: "name" }).selected).toBe(false);

    expect(getAllByRole("option").length).toBe(2);

    await userEvent.selectOptions(
      getByRole("combobox"),
      getByRole("option", { name: "name" }),
    );

    expect(getByRole("option", { name: "name" }).selected).toBe(true);
  });
});
