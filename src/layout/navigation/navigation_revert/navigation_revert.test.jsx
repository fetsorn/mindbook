import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { NavigationRevert } from "./navigation_revert.jsx";

describe("NavigationRevert", () => {
  test("", async () => {
    setQueryStore("record", { _: "mind", mind: "mind" });

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <NavigationRevert />
      </QueryContext.Provider>
    ));

    const revert = getByText("revert");

    await userEvent.click(revert);

    expect(queryStore.record).toEqual(undefined);
  });
});
