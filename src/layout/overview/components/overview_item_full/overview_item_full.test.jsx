import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewItemFull } from "./overview_item_full.jsx";

describe("OverviewItemFull", () => {
  test("", async () => {
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

    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewItemFull item={record} index={index} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
