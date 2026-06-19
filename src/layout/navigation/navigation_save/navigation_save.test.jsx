import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore, onRecordSave } from "@/store/store.js";
import { NavigationSave } from "./navigation_save.jsx";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordSave: vi.fn(),
  };
});

describe("NavigationSave", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    const record = { _: "mind", mind: "mind" };

    setStore("record", record);

    const api = {};

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore, api }}>
          <NavigationSave />
        </Context.Provider>
      </I18nProvider>
    ));

    const save = getByText("save");

    await userEvent.click(save);

    expect(onRecordSave).toHaveBeenCalledWith(
      { store, setStore, api },
      record,
      record,
    );
  });
});
