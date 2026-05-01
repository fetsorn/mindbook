import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { OverviewValue } from "./overview_value.jsx";

describe("OverviewValue", () => {
  test("", async () => {
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

    setQueryStore("schema", schemaRoot);

    const branch = "mind";

    const value = "mind";

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewValue value={value} branch={branch} />
      </QueryContext.Provider>
    ));

    expect(() => getByText("mind")).not.toThrowError();
  });
});
