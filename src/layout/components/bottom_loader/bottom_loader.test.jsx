import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { BottomLoader } from "./bottom_loader.jsx";

describe("BottomLoader", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("loading", true);

    const { getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <BottomLoader />
      </Context.Provider>
    ));

    expect(() => getByText("Loading...")).not.toThrowError();
  });
});
