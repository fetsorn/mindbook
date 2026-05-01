import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewFieldItem } from "./overview_field_item.jsx";

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

describe("OverviewFieldItem", () => {
  test("value", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const branch = "name";

    const item = "a";

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </Context.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });

  test("record", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </Context.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
