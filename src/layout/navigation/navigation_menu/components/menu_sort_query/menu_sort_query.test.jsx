import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/store/default_root_schema.json";
import { MenuSortQuery } from "./menu_sort_query.jsx";

describe("MenuSortQuery", () => {
  test("", async () => {
    setQueryStore("searchParams", "_=mind&.sortBy=mind");
    setQueryStore("schema", schemaRoot);

    const { getByRole, getAllByRole } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <MenuSortQuery />
      </QueryContext.Provider>
    ));

    expect(getByRole("option", { name: "name" }).selected).toBe(false);

    expect(getAllByRole("option").length).toBe(7);

    await userEvent.selectOptions(
      getByRole("combobox"),
      getByRole("option", { name: "name" }),
    );

    expect(getByRole("option", { name: "name" }).selected).toBe(true);
  });
});
