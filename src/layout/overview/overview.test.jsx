import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { Overview } from "./overview.jsx";

describe("Overview", () => {
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

  test("no items", async () => {
    const items = [];

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <Overview items={items} />
      </QueryContext.Provider>
    ));

    expect(() =>
      getByText('press "new" in the top right corner to add entries'),
    ).not.toThrowError();
  });

  test("item", async () => {
    const item = {
      _: "mind",
      mind: "mind",
    };

    const items = [item];

    setQueryStore("recordSet", items);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <Overview />
      </QueryContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
