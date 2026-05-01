import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewField } from "./overview_field.jsx";

describe("OverviewField", () => {
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

    const branch = "branch";

    const baseRecord = { _: "mind", mind: "mind" };

    const items = [];

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewField index={index} branch={branch} items={items} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("field no items")).toThrowError();
  });

  test("record", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = { _: "mind", mind: "mind", branch: items };

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewField index={index} branch={branch} items={items} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
