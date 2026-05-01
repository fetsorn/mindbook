import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
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

    setStore("searchParams", "_=mind&.sortBy=mind");

    const { getByRole, getAllByRole } = render(() => (
      <Context.Provider value={{ store }}>
        <MenuSortQuery />
      </Context.Provider>
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
