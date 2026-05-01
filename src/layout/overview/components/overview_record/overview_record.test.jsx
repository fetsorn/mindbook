import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewRecord } from "./overview_record.jsx";

describe("OverviewRecord", () => {
  beforeEach(() => {
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

    setQueryStore("schema", schemaRoot);
  });

  test("no items", async () => {
    const index = "";

    const baseRecord = { _: "mind", mind: "mind" };

    const record = baseRecord;

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewRecord record={record} index={index} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("record no items")).toThrowError();
  });

  test("", async () => {
    const index = "";

    const value = "a";

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [{ _: "branch", branch: value }],
    };

    const record = baseRecord;

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewRecord record={record} index={index} />
      </QueryContext.Provider>
    ));

    await userEvent.click(getByText("with..."));

    expect(() => getByText("a")).not.toThrowError();
  });
});
