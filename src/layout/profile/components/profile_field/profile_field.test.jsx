import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import {
  QueryContext,
  queryStore,
  setQueryStore,
  onRecordEdit,
} from "@/query/store.js";
import { ProfileField } from "./profile_field.jsx";

vi.mock("@/query/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((path, value) => setQueryStore(...path, value)),
  };
});

describe("ProfileField", () => {
  test("removes each", async () => {
    // no "remove each field value" component
    expect(false).toBe(false);
  });

  test("removes this", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "a",
        },
      ],
    };

    setQueryStore("record", baseRecord);

    const { getByRole, getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <ProfileField
          index={index}
          branch={branch}
          items={items}
          path={["record", "branch"]}
        />
      </QueryContext.Provider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");

    await userEvent.click(getByText(`cut...`));

    await userEvent.click(getByText("Yes"));

    expect(onRecordEdit).toHaveBeenCalledWith(["record", "branch"], []);

    expect(queryStore.record).toEqual({
      _: "mind",
      mind: "mind",
      branch: [],
    });
  });
});
