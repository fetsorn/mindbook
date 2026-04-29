import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import schemaRoot from "@/store/default_root_schema.json";
import { onRecordCreate } from "@/store/store.js";
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
    setQueryStore("schema", schemaRoot);

    const { getByText } = render(() => (
      <QueryContext.Provider value={{ store: queryStore }}>
        <BottomNew />
      </QueryContext.Provider>
    ));

    const bottomNew = getByText("new");

    await userEvent.click(bottomNew);

    expect(onRecordCreate).toHaveBeenCalledWith(undefined);
  });
});
