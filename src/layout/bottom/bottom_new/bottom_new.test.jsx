import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
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
      <Context.Provider value={{ store, setStore }}>
        <BottomNew />
      </Context.Provider>
    ));

    const bottomNew = getByText("new");

    await userEvent.click(bottomNew);

    expect(onRecordCreate).toHaveBeenCalledWith({ store, setStore });
  });
});
