import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { MenuBaseQuery } from "./menu_base_query.jsx";

describe("MenuBaseQuery", () => {
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

    setStore("searchParams", "_=mind");

    const { getByRole, getAllByRole } = render(() => (
      <Context.Provider value={{ store }}>
        <MenuBaseQuery />
      </Context.Provider>
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
