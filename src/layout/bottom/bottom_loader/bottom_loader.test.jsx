import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { BottomLoader } from "./bottom_loader.jsx";

describe("BottomLoader", () => {
  test("", async () => {
    setQueryStore("loading", true);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <BottomLoader />
      </QueryContext.Provider>
    ));

    expect(() => getByText("Loading...")).not.toThrowError();
  });
});
