import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { BottomCount } from "./bottom_count.jsx";

describe("BottomCount", () => {
  test("0", async () => {
    const [store, setStore] = makeStore();

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <BottomCount />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("found 0")).not.toThrowError();
  });

  test("1", async () => {
    const [store, setStore] = makeStore();

    setStore("recordSet", [1]);

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <BottomCount />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("found 1")).not.toThrowError();
  });
});
