import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewFieldItem } from "./overview_field_item.jsx";
import schemaRoot from "@/store/default_root_schema.json";

describe("OverviewFieldItem", () => {
  test("value", async () => {
    setQueryStore("schema", schemaRoot);
    const index = "";

    const branch = "name";

    const item = "a";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });

  test("record", async () => {
    setQueryStore("schema", schemaRoot);
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
