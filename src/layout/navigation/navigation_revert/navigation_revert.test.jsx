import { describe, test, expect } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { NavigationRevert } from "./navigation_revert.jsx";

describe("NavigationRevert", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("record", { _: "mind", mind: "mind" });

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore }}>
          <NavigationRevert />
        </Context.Provider>
      </I18nProvider>
    ));

    const revert = getByText("revert");

    await userEvent.click(revert);

    expect(store.record).toEqual(undefined);
  });
});
