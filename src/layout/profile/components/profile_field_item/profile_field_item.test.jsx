import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { Context, makeStore } from "@/store/store.js";
import { ProfileFieldItem } from "./profile_field_item.jsx";

describe("ProfileFieldItem", () => {
  test("object", async () => {
    const [store, setStore] = makeStore();

    const index = "index";

    const branch = "branch";

    const item = { _: "branch", branch: "a" };

    const items = [item];

    const { getByRole, getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <Context.Provider value={{ store }}>
          <ProfileFieldItem
            index={index}
            branch={branch}
            item={item}
            path={["record", "branch", 0]}
          />
        </Context.Provider>
      </I18nProvider>
    ));

    const input = getByRole("textbox");

    // render an input with value
    expect(input).toHaveTextContent("a");
  });
});
