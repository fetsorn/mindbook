import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { BottomSync } from "./bottom_sync.jsx";

describe("BottomSync", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("mergeResult", false);

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <BottomSync />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("Conflict")).not.toThrowError();
  });
});
