import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/store/default_root_schema.json";
import { OverviewItem } from "./overview_item.jsx";

describe("OverviewItem", () => {
  test("", async () => {
    setQueryStore("schema", schemaRoot);
    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewItem item={record} index={index} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
