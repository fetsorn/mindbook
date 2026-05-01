import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { MenuBaseQuery } from "./menu_base_query.jsx";

describe("MenuBaseQuery", () => {
  beforeEach(() => {
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

    setQueryStore("schema", schemaRoot);
  });

  test("", async () => {
    setQueryStore("searchParams", "_=mind");

    const { getByRole, getAllByRole } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <MenuBaseQuery />
      </QueryContext.Provider>
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
