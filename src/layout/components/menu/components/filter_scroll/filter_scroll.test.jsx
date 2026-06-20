import { describe, test, expect, beforeEach, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import { I18nProvider } from "@lingui/solid";
import { i18n } from "@/i18n.js";
import { FilterScroll } from "./filter_scroll.jsx";

describe("FilterScroll", () => {
  test("", async () => {
    const { getByText } = render(() => (
      <I18nProvider i18n={i18n}>
        <FilterScroll />
      </I18nProvider>
    ));

    expect(() => getByText("scroll to top")).not.toThrowError();
  });
});
