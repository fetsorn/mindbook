import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { cleanup, render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import {
  Menu,
  Filter,
  Header,
  Item,
  ItemFull,
  BottomCount,
  BottomLoader,
  BottomNew,
  BottomSync,
} from "./components/index.js";
import { App, Layout } from "./layout.jsx";

vi.mock("./components/index.js", () => ({
  Spoiler: vi.fn(),
  Confirmation: vi.fn(),
  Preview: vi.fn(),
  isURL: vi.fn(),
  isShowable: vi.fn(),
  Menu: vi.fn(),
  Filter: vi.fn(),
  Header: vi.fn(),
  Item: vi.fn(),
  ItemFull: vi.fn(),
  BottomCount: vi.fn(),
  BottomLoader: vi.fn(),
  BottomNew: vi.fn(),
  BottomSync: vi.fn(),
}));

describe("Layout", () => {
  test("layout", async () => {
    const [store, setStore] = makeStore();

    render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <Layout />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(Menu).toHaveBeenCalledWith({});

    expect(Header).toHaveBeenCalledWith({});

    expect(Filter).toHaveBeenCalledWith({});

    expect(BottomCount).toHaveBeenCalledWith({});

    expect(BottomLoader).toHaveBeenCalledWith({});

    expect(BottomNew).toHaveBeenCalledWith({});

    expect(BottomSync).toHaveBeenCalledWith({});
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
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore, api }}>
          <App />
        </Context.Provider>
      </I18nProvider>
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
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore, api }}>
          <App />
        </Context.Provider>
      </I18nProvider>
    ));
  });
});
