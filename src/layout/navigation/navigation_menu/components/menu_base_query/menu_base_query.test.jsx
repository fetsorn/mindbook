import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import { MenuBaseQuery } from "./menu_base_query.jsx";

describe("MenuBaseQuery", () => {
  test("", async () => {
    setQueryStore("searchParams", "_=mind");
    setQueryStore("schema", schemaRoot);

    const { getByRole, getAllByRole } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <MenuBaseQuery />
      </QueryContext.Provider>
    ));

    expect(getByRole("option", { name: "mind" }).selected).toBe(true);

    expect(getAllByRole("option").length).toBe(14);

    await userEvent.selectOptions(
      getByRole("combobox"),
      getByRole("option", { name: "branch" }),
    );

    expect(getByRole("option", { name: "branch" }).selected).toBe(true);
  });
});
