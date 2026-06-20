import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore, onRecordCreate } from "@/store/store.js";
import { BottomNew } from "./bottom_new.jsx";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordCreate: vi.fn(),
  };
});

describe("BottomNew", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    const schemaRoot = {
      mind: {
        trunks: [],
        leaves: ["name"],
      },
      name: {
        trunks: ["mind"],
        leaves: [],
      },
    };

    setStore("schema", schemaRoot);

    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore }}>
          <BottomNew />
        </Context.Provider>
      </I18nProvider>
    ));

    const bottomNew = getByText("new");

    await userEvent.click(bottomNew);

    expect(onRecordCreate).toHaveBeenCalledWith({ store, setStore });
  });
});
