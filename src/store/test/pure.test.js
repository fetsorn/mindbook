import { describe, expect, test } from "vitest";
import { findFirstSortBy, sonKey, sonKeys } from "@/store/pure.js";
import stub from "./stub.js";

describe("findFirstSortBy", () => {
  test("", () => {
    expect(findFirstSortBy("a", { _: "a", a: "b" })).toBe("b");
  });
});

describe("sonKey", () => {
  test("extracts key from scalar", () => {
    expect(sonKey("parent", "father")).toBe("father");
  });

  test("extracts key from object", () => {
    expect(sonKey("parent", { _: "person", parent: "father" })).toBe("father");
  });

  test("returns undefined for null", () => {
    expect(sonKey("parent", null)).toBe(undefined);
  });

  test("returns undefined for undefined", () => {
    expect(sonKey("parent", undefined)).toBe(undefined);
  });
});

describe("sonKeys", () => {
  test("missing record yields no keys", () => {
    expect(sonKeys(undefined, "parent")).toEqual([]);
  });

  test("absent branch yields no keys", () => {
    expect(sonKeys({ _: "person", person: "granma" }, "parent")).toEqual([]);
  });

  test("scalar value yields one key", () => {
    expect(sonKeys({ parent: "father" }, "parent")).toEqual(["father"]);
  });

  test("array of scalars yields many keys", () => {
    expect(sonKeys({ parent: ["mother", "father"] }, "parent")).toEqual([
      "mother",
      "father",
    ]);
  });

  test("object values are unwrapped by branch key", () => {
    expect(
      sonKeys({ parent: { _: "person", parent: "father" } }, "parent"),
    ).toEqual(["father"]);
  });

  test("null branch value yields no keys", () => {
    expect(sonKeys({ parent: null }, "parent")).toEqual([]);
  });

  test("mixed array of scalars and objects", () => {
    expect(
      sonKeys(
        { parent: ["mother", { _: "person", parent: "father" }] },
        "parent",
      ),
    ).toEqual(["mother", "father"]);
  });
});
