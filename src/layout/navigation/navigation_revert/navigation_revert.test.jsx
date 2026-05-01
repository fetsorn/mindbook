import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { NavigationRevert } from "./navigation_revert.jsx";

describe("NavigationRevert", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("record", { _: "mind", mind: "mind" });

    const { getByText } = render(() => (
      <Context.Provider value={{ store, setStore }}>
        <NavigationRevert />
      </Context.Provider>
    ));

    const revert = getByText("revert");

    await userEvent.click(revert);

    expect(store.record).toEqual(undefined);
  });
});
