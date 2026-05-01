import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { Overview } from "./overview.jsx";

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

describe("Overview", () => {
  test("no items", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const items = [];

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <Overview items={items} />
      </Context.Provider>
    ));

    expect(() =>
      getByText('press "new" in the top right corner to add entries'),
    ).not.toThrowError();
  });

  test("item", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const item = {
      _: "mind",
      mind: "mind",
    };

    const items = [item];

    setStore("recordSet", items);

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <Overview />
      </Context.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
