import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { MenuSortQuery } from "./menu_sort_query.jsx";

describe("MenuSortQuery", () => {
  beforeEach(() => {
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

    setQueryStore("schema", schemaRoot);
  });

  test("", async () => {
    setQueryStore("searchParams", "_=mind&.sortBy=mind");

    const { getByRole, getAllByRole } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <MenuSortQuery />
      </QueryContext.Provider>
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
