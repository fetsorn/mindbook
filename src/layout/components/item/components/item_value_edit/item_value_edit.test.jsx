import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore, onRecordEdit } from "@/store/store.js";
import { ItemValueEdit } from "./item_value_edit.jsx";

const [store, setStore] = makeStore();

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((context, path, value) => setStore(...path, value)),
  };
});

test("item value edit", async () => {
  const record = { _: "mind", mind: "mind" };

  setStore("record", record);

  const path = ["record", "mind"];

  const { getByRole } = render(() => (
    <I18nProvider i18n={i18n}>
      <Context.Provider value={{ store, setStore }}>
        <ItemValueEdit value={store.record.mind} branch="mind" path={path} />
      </Context.Provider>
    </I18nProvider>
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("mind");

  await userEvent.click(input);

  await userEvent.keyboard("1");

  expect(onRecordEdit).toHaveBeenCalledWith(
    { store, setStore },
    path,
    "mind1",
  );

  expect(store.record.mind).toBe("mind1");
});
