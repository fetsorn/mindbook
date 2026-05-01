import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
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
    const [store, setStore] = makeStore();

    const baseRecord = { _: "mind", mind: "mind" };

    setStore("record", baseRecord);

    render(() => (
      <Context.Provider value={{ store }}>
        <Profile />
      </Context.Provider>
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
