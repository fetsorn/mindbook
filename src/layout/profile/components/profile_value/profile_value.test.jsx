import { test, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { queryStore, setQueryStore, onRecordEdit } from "@/query/store.js";
import { ProfileValue } from "./profile_value.jsx";

vi.mock("@/query/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((path, value) => setQueryStore(...path, value)),
  };
});

test("profile value", async () => {
  const record = { _: "mind", mind: "mind" };

  setQueryStore("record", record);

  const path = ["record", "mind"];

  const { getByText, getByRole } = render(() => (
    <ProfileValue value={queryStore.record.mind} branch="mind" path={path} />
  ));

  const input = getByRole("textbox");

  expect(input).toHaveTextContent("mind");

  input.focus();

  await userEvent.keyboard("a");

  expect(onRecordEdit).toHaveBeenCalledWith(path, "amind");

  expect(queryStore.record.mind).toBe("amind");
});
