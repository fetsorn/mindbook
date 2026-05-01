import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewField } from "./overview_field.jsx";

const schemaRoot = {
  mind: {
    trunks: [],
    leaves: ["name", "branch"],
  },
  name: {
    trunks: ["mind"],
    leaves: [],
  },
  branch: {
    trunks: ["mind"],
    leaves: ["task"],
  },
  task: {
    trunks: ["branch"],
    leaves: [],
  },
};

describe("OverviewField", () => {
  test("no items", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const branch = "branch";

    const baseRecord = { _: "mind", mind: "mind" };

    const items = [];

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewField index={index} branch={branch} items={items} />
      </Context.Provider>
    ));

    expect(() => getByText("field no items")).toThrowError();
  });

  test("record", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "mind", mind: "mind", branch: items };

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewField index={index} branch={branch} items={items} />
      </Context.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
