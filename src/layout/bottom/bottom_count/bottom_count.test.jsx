import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { BottomCount } from "./bottom_count.jsx";

describe("BottomCount", () => {
  test("0", async () => {
    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <BottomCount />
      </QueryContext.Provider>
    ));

    expect(() => getByText("found 0")).not.toThrowError();
  });

  test("1", async () => {
    setQueryStore("recordSet", [1]);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <BottomCount />
      </QueryContext.Provider>
    ));

    expect(() => getByText("found 1")).not.toThrowError();
  });
});
