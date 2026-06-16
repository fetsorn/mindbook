import { describe, expect, test } from "vitest";
import { chainRole } from "@/style/rhetoric.js";

describe("chainRole", () => {
  test("returns [] when chainRole is undefined", () => {
    expect(chainRole({})).toEqual([]);
  });

  test("returns [] for UI-only meta", () => {
    expect(chainRole({ isFolded: true })).toEqual([]);
    expect(chainRole({ isItem: true })).toEqual([]);
  });

  test("cause-nucleus returns rst-chain-focus", () => {
    expect(chainRole({ chainRole: "cause-nucleus" })).toEqual([
      "rst-chain-focus",
    ]);
  });

  test("cause-satellite returns rst-chain-cause", () => {
    expect(chainRole({ chainRole: "cause-satellite" })).toEqual([
      "rst-chain-cause",
    ]);
  });

  test("result-satellite returns rst-chain-result", () => {
    expect(chainRole({ chainRole: "result-satellite" })).toEqual([
      "rst-chain-result",
    ]);
  });

  test("unknown chainRole returns []", () => {
    expect(chainRole({ chainRole: "something-else" })).toEqual([]);
  });
});
