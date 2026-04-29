import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { BottomSync } from "./bottom_sync.jsx";

describe("BottomSync", () => {
  test("", async () => {
    setQueryStore("mergeResult", false);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <BottomSync />
      </QueryContext.Provider>
    ));

    expect(() => getByText("Conflict")).not.toThrowError();
  });
});
