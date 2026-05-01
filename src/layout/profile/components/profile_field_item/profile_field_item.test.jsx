import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import { ProfileFieldItem } from "./profile_field_item.jsx";

describe("ProfileFieldItem", () => {
  test("object", async () => {
    const [store, setStore] = makeStore();

    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const { getByRole, getByText } = render(() => (
      <Context.Provider value={{ store }}>
        <ProfileFieldItem
          index={index}
          branch={branch}
          item={item}
          path={["record", "branch", 0]}
        />
      </Context.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });
});
