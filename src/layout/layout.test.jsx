import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { cleanup, render } from "@solidjs/testing-library";
import { onMindChange } from "@/store/store.js";
import { ApiProvider } from "@/context.js";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore, setProxyStore } from "@/proxy/store.js";
import {
  NavigationBack,
  NavigationRevert,
  NavigationSave,
  NavigationMenu,
} from "./navigation/index.js";
import {
  BottomCount,
  BottomLoader,
  BottomNew,
  BottomSync,
} from "./bottom/index.js";
import { Overview } from "./overview/overview.jsx";
import { Profile } from "./profile/profile.jsx";
import { App, LayoutOverview, LayoutProfile } from "./layout.jsx";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onMindChange: vi.fn(),
  };
});

vi.mock("./navigation/index.js", () => ({
  NavigationBack: vi.fn(),
  NavigationRevert: vi.fn(),
  NavigationSave: vi.fn(),
  NavigationMenu: vi.fn(),
}));

vi.mock("./bottom/index.js", () => ({
  BottomCount: vi.fn(),
  BottomLoader: vi.fn(),
  BottomNew: vi.fn(),
  BottomSync: vi.fn(),
}));

vi.mock("./overview/overview.jsx", () => ({
  Overview: vi.fn(),
}));

vi.mock("./profile/profile.jsx", () => ({
  Profile: vi.fn(),
}));

describe("LayoutOverview", () => {
  test("layout", async () => {
    render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <LayoutOverview />
      </QueryContext.Provider>
    ));

    expect(NavigationBack).toHaveBeenCalledWith({});

    expect(NavigationMenu).toHaveBeenCalledWith({});

    expect(Overview).toHaveBeenCalledWith({});

    expect(BottomCount).toHaveBeenCalledWith({});

    expect(BottomLoader).toHaveBeenCalledWith({});

    expect(BottomNew).toHaveBeenCalledWith({});

    expect(BottomSync).toHaveBeenCalledWith({});
  });
});

describe("LayoutProfile", () => {
  test("", async () => {
    setQueryStore("record", { _: "mind", mind: "mind" });

    render(() => (
      <ProxyContext.Provider value={{ store: proxyStore }}>
        <QueryContext.Provider value={{ store: queryStore }}>
          <LayoutProfile />
        </QueryContext.Provider>
      </ProxyContext.Provider>
    ));

    expect(NavigationRevert).toHaveBeenCalledWith({});

    expect(NavigationSave).toHaveBeenCalledWith({});

    expect(Profile).toHaveBeenCalledWith({});
  });
});

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  test("git commit", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    const { getByText } = render(() => (
      <ApiProvider value={api}>
        <App />
      </ApiProvider>
    ));

    expect(() =>
      getByText(__COMMIT_HASH__, {
        includeHidden: true,
      }),
    ).not.toThrowError();
  });

  test("change mind", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    onMindChange.mockReset();

    render(() => (
      <ApiProvider value={api}>
        <App />
      </ApiProvider>
    ));
  });
});
