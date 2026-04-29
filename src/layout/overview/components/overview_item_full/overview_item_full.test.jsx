import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore } from "@/proxy/store.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import { OverviewItemFull } from "./overview_item_full.jsx";

describe("OverviewItemFull", () => {
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
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <OverviewItemFull item={record} index={index} />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
