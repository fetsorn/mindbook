import { describe, test, expect, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewFieldItem } from "./overview_field_item.jsx";

describe("OverviewFieldItem", () => {
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

  test("value", async () => {
    const index = "";

    const branch = "name";

    const item = "a";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });

  test("record", async () => {
    const index = "";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewFieldItem index={index} branch={branch} item={item} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("a")).not.toThrowError();
  });
});
