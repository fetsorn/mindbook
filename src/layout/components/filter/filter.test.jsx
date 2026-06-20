import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore, setQuery } from "@/store/store.js";
import { Filter } from "./filter.jsx";

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    setQuery: vi.fn(),
  };
});

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

describe("Filter", () => {
  test("", async () => {
    const [store, setStore] = makeStore();

    setStore("schema", schemaRoot);

    const { getByText, getByRole } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <Filter />
        </Context.Provider>
      </I18nProvider>
    ));

    const input = getByRole("textbox");

    input.focus();

    await userEvent.keyboard("a");

    expect(setQuery).toHaveBeenCalledWith({ store }, "a");

    expect(() => getByText("search")).not.toThrowError();
  });
});
