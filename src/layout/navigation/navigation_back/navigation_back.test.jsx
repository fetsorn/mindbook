import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { ProxyContext, proxyStore, setProxyStore } from "@/proxy/store.js";
import { ApiProvider } from "@/context.js";
import { onStartup } from "@/store/store.js";
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

    setProxyStore("mind", { _: "mind", mind: "somemind" });

    const { getByText } = render(() => (
      <ApiProvider value={api}>
        <ProxyContext.Provider value={{ store: proxyStore }}>
          <NavigationBack />
        </ProxyContext.Provider>
      </ApiProvider>
    ));

    const back = getByText("back");

    await userEvent.click(back);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(proxyStore.mind).toEqual({ _: "mind", mind: "root", name: "minds" });
  });
});
