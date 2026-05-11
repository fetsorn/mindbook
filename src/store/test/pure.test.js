import { describe, expect, test } from "vitest";
import { changeSearchParams, findFirstSortBy } from "@/store/pure.js";
import stub from "./stub.js";

describe("changeSearchParams", () => {
  test("ignores empty field", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "", 2).toString(),
    ).toStrictEqual("_=a&a=1");
  });

  test("erases params", () => {
    expect(
      changeSearchParams(
        new URLSearchParams("_=a&a=1"),
        undefined,
        undefined,
      ).toString(),
    ).toStrictEqual("");
  });

  test("sets base and sortBy", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "_", "b").toString(),
    ).toStrictEqual("_=b&.sortBy=b");
  });

  test("deletes value", () => {
    expect(
      changeSearchParams(
        new URLSearchParams("_=a&a=1"),
        "a",
        undefined,
      ).toString(),
    ).toStrictEqual("_=a");
  });

  test("sets value", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "b", 2).toString(),
    ).toStrictEqual("_=a&a=1&b=2");
  });
});

describe("findFirstSortBy", () => {
  test("", () => {
    expect(findFirstSortBy("a", { _: "a", a: "b" })).toBe("b");
  });
});
