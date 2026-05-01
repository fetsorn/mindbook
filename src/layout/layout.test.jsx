import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { cleanup, render } from "@solidjs/testing-library";
import { Context, makeStore } from "@/store/store.js";
import {
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

vi.mock("./navigation/index.js", () => ({
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
    const [store, setStore] = makeStore();

    render(() => (
      <Context.Provider value={{ store }}>
        <LayoutOverview />
      </Context.Provider>
    ));

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
    const [store, setStore] = makeStore();

    setStore("record", { _: "mind", mind: "mind" });

    render(() => (
      <Context.Provider value={{ store }}>
        <LayoutProfile />
      </Context.Provider>
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

    const [store, setStore] = makeStore();

    const { getByText } = render(() => (
      <Context.Provider value={{ store, setStore, api }}>
        <App />
      </Context.Provider>
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

    const [store, setStore] = makeStore();

    render(() => (
      <Context.Provider value={{ store, setStore, api }}>
        <App />
      </Context.Provider>
    ));
  });
});
