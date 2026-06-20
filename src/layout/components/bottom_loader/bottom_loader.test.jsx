import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { BottomLoader } from "./bottom_loader.jsx";

describe("BottomLoader", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("loading", true);

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <BottomLoader />
        </Context.Provider>
      </I18nProvider>
    ));

    expect(() => getByText("loading...")).not.toThrowError();
  });
});
