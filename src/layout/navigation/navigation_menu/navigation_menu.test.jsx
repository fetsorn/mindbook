import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import {
  MenuSortQuery,
  MenuBaseQuery,
} from "@/layout/navigation/navigation_menu/components/index.js";
import { NavigationMenu } from "./navigation_menu.jsx";

vi.mock(
  "@/layout/navigation/navigation_menu/components/index.js",
  async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      MenuSortQuery: vi.fn(),
      MenuBaseQuery: vi.fn(),
    };
  },
);

describe("NavigationMenu", () => {
  test("", async () => {
    const { getByText } = render(() => <NavigationMenu />);

    expect(MenuBaseQuery).toHaveBeenCalled();

    expect(MenuSortQuery).toHaveBeenCalled();
  });
});
