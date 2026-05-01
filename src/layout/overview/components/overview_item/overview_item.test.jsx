import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewItem } from "./overview_item.jsx";

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

describe("OverviewItem", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

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
        <OverviewItem item={record} index={index} />
      </Context.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
