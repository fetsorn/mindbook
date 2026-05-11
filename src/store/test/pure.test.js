import { describe, expect, test } from "vitest";
import { findFirstSortBy } from "@/store/pure.js";
import stub from "./stub.js";

describe("findFirstSortBy", () => {
  test("", () => {
    expect(findFirstSortBy("a", { _: "a", a: "b" })).toBe("b");
  });
});
