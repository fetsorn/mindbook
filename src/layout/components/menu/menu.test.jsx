import { describe, test, expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { render } from "@solidjs/testing-library";
import {
  MenuSort,
  MenuBase,
  MenuChain,
  MenuLang,
} from "./components/index.js";
import { Menu } from "./menu.jsx";

vi.mock(
  "./components/index.js",
  async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      MenuSort: vi.fn(),
      MenuBase: vi.fn(),
      MenuChain: vi.fn(),
      MenuLang: vi.fn(),
    };
  },
);

describe("Menu", () => {
  test("", async () => {
    const { getByText } = render(() => <Menu />);

    expect(MenuBase).toHaveBeenCalled();

    expect(MenuSort).toHaveBeenCalled();
  });
});
