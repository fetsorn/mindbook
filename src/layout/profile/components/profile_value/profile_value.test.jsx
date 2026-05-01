import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { Context, makeStore, onRecordEdit } from "@/store/store.js";
import { ProfileValue } from "./profile_value.jsx";

const [store, setStore] = makeStore();

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((context, path, value) => setStore(...path, value)),
  };
});

test("profile value", async () => {
  const record = { _: "mind", mind: "mind" };

  setStore("record", record);

  const path = ["record", "mind"];

  const { getByText, getByRole } = render(() => (
    <Context.Provider value={{ store, setStore }}>
      <ProfileValue value={store.record.mind} branch="mind" path={path} />
    </Context.Provider>
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("mind");

  input.focus();

  await userEvent.keyboard("a");

  expect(onRecordEdit).toHaveBeenCalledWith({ store, setStore }, path, "amind");

  expect(store.record.mind).toBe("amind");
});
