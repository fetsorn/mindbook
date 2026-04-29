import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import { OverviewRecord } from "./overview_record.jsx";

describe("OverviewRecord", () => {
  test("no items", async () => {
    setQueryStore("schema", schemaRoot);
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
    setQueryStore("schema", schemaRoot);
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
