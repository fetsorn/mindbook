import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { Profile } from "./profile.jsx";
import { ProfileRecord } from "./components/index.js";

vi.mock("./components/index.js", () => {
  // don't await original import, it hangs, likely because of reexports
  return {
    ProfileRecord: vi.fn(),
  };
});

describe("Profile", () => {
  test("", () => {
    const baseRecord = { _: "mind", mind: "mind" };

    setQueryStore("record", baseRecord);

    render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <Profile />
      </QueryContext.Provider>
    ));

    expect(ProfileRecord).toHaveBeenCalledWith({
      index: "_",
      isOpenDefault: true,
      record: {
        _: "mind",
        mind: "mind",
      },
      path: ["record"],
    });
  });
});
