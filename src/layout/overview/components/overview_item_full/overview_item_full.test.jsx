import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewItemFull } from "./overview_item_full.jsx";

describe("OverviewItemFull", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

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

    setStore("schema", schemaRoot);

    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewItemFull item={record} index={index} />
      </Context.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
