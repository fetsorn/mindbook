import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore } from "@/proxy/store.js";
import { OverviewField } from "./overview_field.jsx";
import schemaRoot from "@/proxy/default_root_schema.json";

describe("OverviewField", () => {
  test("no items", async () => {
    setQueryStore("schema", schemaRoot);
    const index = "";

    const branch = "branch";

    const baseRecord = { _: "mind", mind: "mind" };

    const items = [];

    const { getByText } = render(() => (
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <OverviewField index={index} branch={branch} items={items} />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(() => getByText("field no items")).toThrowError();
  });

  test("record", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "mind", mind: "mind", branch: items };

    const { getByText } = render(() => (
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <OverviewField index={index} branch={branch} items={items} />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
