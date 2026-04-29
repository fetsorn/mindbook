import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore } from "@/query/store.js";
import { ProfileFieldItem } from "./profile_field_item.jsx";

describe("ProfileFieldItem", () => {
  test("object", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const { getByRole, getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <ProfileFieldItem
          index={index}
          branch={branch}
          item={item}
          path={["record", "branch", 0]}
        />
      </QueryContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });
});
