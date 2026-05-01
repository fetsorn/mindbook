import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore, onSearchBar } from "@/store/store.js";
import { OverviewFilter } from "./overview_filter.jsx";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onSearchBar: vi.fn(),
  };
});

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

describe("OverviewFilter", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const { getByText, getByRole } = render(() => (
      <Context.Provider value={{ store }}>
        <OverviewFilter />
      </Context.Provider>
    ));

    const input = getByRole("textbox");

    input.focus();

    await userEvent.keyboard("a");

    expect(onSearchBar).toHaveBeenCalledWith({ store }, "a");

    expect(() => getByText("search")).not.toThrowError();
  });
});
