import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import { OverviewValue } from "./overview_value.jsx";

describe("OverviewValue", () => {
  test("", async () => {
    setQueryStore("schema", schemaRoot);
    const branch = "mind";

    const value = "mind";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewValue value={value} branch={branch} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
