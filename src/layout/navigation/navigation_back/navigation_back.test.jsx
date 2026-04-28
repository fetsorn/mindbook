import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { StoreContext, store } from "@/store/index.js";
import { ApiProvider } from "@/context.js";
import { setStore, onStartup } from "@/store/store.js";
import { NavigationBack } from "./navigation_back.jsx";

describe("NavigationBack", () => {
  test("", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn,
      commit: vi.fn(),
    };

    await onStartup(api);

    setStore("mind", { _: "mind", mind: "somemind" });

    const { getByText } = render(() => (
      <ApiProvider value={api}>
        <StoreContext.Provider value={{ store }}>
          <NavigationBack />
        </StoreContext.Provider>
      </ApiProvider>
    ));

    const back = getByText("back");

    await userEvent.click(back);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(store.mind).toEqual({ _: "mind", mind: "root", name: "minds" });
  });
});
