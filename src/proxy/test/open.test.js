import { describe, expect, test, vi } from "vitest";
import { newUUID } from "@/query/record.js";
import { readSchema } from "@/store/record.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/query/pure.js";
import { find, clone } from "@/proxy/open.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import stub from "./stub.js";

vi.mock("@/query/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    enrichBranchRecords: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/store/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readSchema: vi.fn(),
  };
});

vi.mock("@/query/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    newUUID: vi.fn(),
  };
});

describe("find", () => {
  test("throws on error", async () => {
    const api = {
      select: vi.fn(async () => {
        throw Error("error");
      }),
    };

    await expect(() => find(api, undefined, stub.name)).rejects.toThrowError();
  });

  test("finds the root", async () => {
    const result = await find({}, "root", undefined);

    expect(result).toStrictEqual({
      schema: schemaRoot,
      mind: { _: "mind", mind: "root", name: "minds" },
    });
  });

  test("finds a mind", async () => {
    const testCase = stub.cases.tags;

    const api = { select: vi.fn(() => [testCase.record]) };

    readSchema.mockReset();

    readSchema.mockImplementation(() => stub.schema);

    const result = await find(api, stub.id, undefined);

    expect(api.select).toHaveBeenCalledWith("root", {
      _: "mind",
      mind: stub.id,
    });

    expect(result).toStrictEqual({
      schema: stub.schema,
      mind: testCase.record,
    });
  });
});

describe("clone", () => {
  test("throws on error", async () => {
    const testCase = stub.cases.tags;

    //crypto.subtle.digest = vi.fn(() => {
    //  throw Error("");
    //});

    await expect(() =>
      clone({}, testCase.url, testCase.token),
    ).rejects.toThrowError();
  });

  test("clones a mind", async () => {
    const testCase = stub.cases.tags;

    const api = {
      clone: vi.fn(),
      select: vi.fn(() => [testCase.record]),
    };

    newUUID.mockImplementation(() => stub.id);

    readSchema.mockReset();

    readSchema.mockImplementation(() => testCase.schema);

    schemaToBranchRecords.mockImplementation(() => [
      testCase.schemaRecord,
      testCase.metaRecords,
    ]);

    enrichBranchRecords.mockImplementation(() => testCase.branchRecords);

    const result = await clone(api, testCase.url, testCase.token);

    expect(api.clone).toHaveBeenCalledWith(testCase.hash, {
      url: testCase.url,
      token: testCase.token,
    });

    expect(readSchema).toHaveBeenCalledWith(api, testCase.hash);

    const c = {
      _: "mind",
      mind: "id",
      name: "name",
      branch: [
        {
          _: "branch",
          branch: "branch1",
          leaf: ["branch2"],
          trunk: [],
        },
        {
          _: "branch",
          branch: "branch2",
          leaf: [],
          task: "date",
          trunk: ["branch1"],
        },
      ],
      origin_url: {
        _: "origin_url",
        origin_url: "https://example.com/name",
        origin_token: "token",
      },
    };

    expect(result.schema).toStrictEqual(testCase.schema);

    expect(result.mind).toStrictEqual(c);
  });
});
