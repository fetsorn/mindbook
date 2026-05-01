import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { BottomSync } from "./bottom_sync.jsx";

describe("BottomSync", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("mergeResult", false);

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <BottomSync />
      </Context.Provider>
    ));

    expect(() => getByText("Conflict")).not.toThrowError();
  });
});
