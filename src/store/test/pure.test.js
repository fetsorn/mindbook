import { describe, expect, test } from "vitest";
import {
  ensureTrunk,
  searchParamsToQuery,
  changeSearchParams,
  findFirstSortBy,
} from "@/store/pure.js";
import stub from "./stub.js";

describe("ensureTrunk", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      ensureTrunk(stub.schema, testCase.queryObject, stub.trunk, stub.leaf),
    ).toThrowError();
  });

  test("does nothing when has trunk", () => {
    const testCase = stub.cases.baseValue;

    expect(
      ensureTrunk(stub.schema, testCase.queryObject, stub.root, stub.trunk),
    ).toStrictEqual(testCase.queryObject);
  });

  test("adds trunk", () => {
    const testCase = stub.cases.baseValue;

    expect(
      ensureTrunk(stub.schema, testCase.queryObject, stub.trunk, stub.twig),
    ).toStrictEqual({ _: "a", a: "1", b: { _: "b" } });
  });
});

describe("searchParamsToQuery", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toStrictEqual(testCase.queryObject);
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toStrictEqual(testCase.queryObject);
  });

  test("query nested value", () => {
    const testCase = stub.cases.nestedValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toStrictEqual(testCase.queryObject);
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toStrictEqual(testCase.queryObject);
  });
});

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
