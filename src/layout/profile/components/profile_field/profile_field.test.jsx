import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore, onRecordEdit } from "@/store/store.js";
import { ProfileField } from "./profile_field.jsx";

const [store, setStore] = makeStore();

vi.mock("@/store/store.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    onRecordEdit: vi.fn((context, path, value) => setStore(...path, value)),
  };
});

describe("ProfileField", () => {
  test("removes each", async () => {
    // no "remove each field value" component
    expect(false).toBe(false);
  });

  test("removes this", async () => {
    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const baseRecord = {
      _: "mind",
      mind: "mind",
      branch: [
        {
          _: "branch",
          branch: "a",
        },
      ],
    };

    setStore("record", baseRecord);

    const { getByRole, getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store, setStore }}>
          <ProfileField
            index={index}
            branch={branch}
            items={items}
            path={["record", "branch"]}
          />
        </Context.Provider>
      </I18nProvider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");

    await userEvent.click(getByText(`cut...`));

    await userEvent.click(getByText("Yes"));

    expect(onRecordEdit).toHaveBeenCalledWith(
      { store, setStore },
      ["record", "branch"],
      [],
    );

    expect(store.record).toEqual({
      _: "mind",
      mind: "mind",
      branch: [],
    });
  });
});
