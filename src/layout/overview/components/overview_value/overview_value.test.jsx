import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewValue } from "./overview_value.jsx";

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
    leaves: [],
  },
};

describe("OverviewValue", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const branch = "mind";

    const value = "mind";

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewValue value={value} branch={branch} />
      </Context.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
