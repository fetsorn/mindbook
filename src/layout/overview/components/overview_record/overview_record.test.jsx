import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { OverviewRecord } from "./overview_record.jsx";

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

describe("OverviewRecord", () => {
  test("no items", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const baseRecord = { _: "mind", mind: "mind" };

    const record = baseRecord;

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewRecord record={record} index={index} />
      </Context.Provider>
    ));

    expect(() => getByText("record no items")).toThrowError();
  });

  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [{ _: "branch", branch: value }],
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewRecord record={record} index={index} />
      </Context.Provider>
    ));

    await userEvent.click(getByText("with..."));

    expect(() => getByText("a")).not.toThrowError();
  });
});
