import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import {
  QueryContext,
  queryStore,
  setQueryStore,
  onSearchBar,
} from "@/query/store.js";
import { OverviewFilter } from "./overview_filter.jsx";

vi.mock("@/query/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onSearchBar: vi.fn(),
  };
});

describe("OverviewFilter", () => {
  beforeEach(() => {
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

    setQueryStore("schema", schemaRoot);
  });

  test("", async () => {
    const { getByText, getByRole } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <OverviewFilter />
      </QueryContext.Provider>
    ));

    const input = getByRole("textbox");

    input.focus();

    await userEvent.keyboard("a");

    expect(onSearchBar).toHaveBeenCalledWith("a");

    expect(() => getByText("search")).not.toThrowError();
  });
});
