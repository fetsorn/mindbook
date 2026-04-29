import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { onRecordSave } from "@/store/store.js";
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
    const record = { _: "mind", mind: "mind" };

    setQueryStore("record", record);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <NavigationSave />
      </QueryContext.Provider>
    ));

    const save = getByText("save");

    await userEvent.click(save);

    expect(onRecordSave).toHaveBeenCalledWith(undefined, record, record);
  });
});
