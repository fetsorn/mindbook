import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ApiProvider } from "@/context.js";
import { onStartup } from "@/proxy/store.js";
import { NavigationBack } from "./navigation_back.jsx";

describe("NavigationBack", () => {
  test("", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn,
      commit: vi.fn(),
      getOrigin: vi.fn(),
      selectStream: vi.fn(),
    };

    await onStartup(api);

    setQueryStore("mind", { _: "mind", mind: "somemind" });

    const { getByText } = render(() => (
      <ApiProvider value={api}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <NavigationBack />
        </QueryContext.Provider>
      </ApiProvider>
    ));

    const back = getByText("back");

    await userEvent.click(back);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(queryStore.mind).toEqual({ _: "mind", mind: "root", name: "minds" });
  });
});
