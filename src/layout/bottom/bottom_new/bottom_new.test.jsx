import { describe, test, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { onRecordCreate } from "@/query/store.js";
import { BottomNew } from "./bottom_new.jsx";

vi.mock("@/query/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordCreate: vi.fn(),
  };
});

describe("BottomNew", () => {
  beforeEach(() => {
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

    setQueryStore("schema", schemaRoot);
  });

  test("", async () => {
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
