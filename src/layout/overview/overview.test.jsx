import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore, setProxyStore } from "@/proxy/store.js";
import { Overview } from "./overview.jsx";
import schemaRoot from "@/proxy/default_root_schema.json";

describe("Overview", () => {
  test("no items", async () => {
    setQueryStore("schema", schemaRoot);
    const items = [];

    const { getByText } = render(() => (
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <Overview items={items} />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(() =>
      getByText('press "new" in the top right corner to add entries'),
    ).not.toThrowError();
  });

  test("item", async () => {
    setQueryStore("schema", schemaRoot);
    const item = {
      _: "mind",
      mind: "mind",
    };

    const items = [item];

    setQueryStore("recordSet", items);

    const { getByText } = render(() => (
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <Overview />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
