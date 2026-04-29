import { describe, expect, test, vi } from "vitest";
import { updateRecord, createRecord, selectStream } from "@/store/impure.js";
import { newUUID, updateMind, updateEntry } from "@/store/record.js";
import { saveMindRecord, loadMindRecord } from "@/proxy/record.js";
import defaultMindRecord from "@/proxy/default_mind_record.json";
import stub from "./stub.js";

vi.mock("@/query/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    extractSchemaRecords: vi.fn(),
    enrichBranchRecords: vi.fn(),
    recordsToSchema: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/proxy/open.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    find: vi.fn(),
    clone: vi.fn(),
  };
});

vi.mock("@/store/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    newUUID: vi.fn(),
    readSchema: vi.fn(),
    createRoot: vi.fn(),
    updateMind: vi.fn(),
    updateEntry: vi.fn(),
    deleteRecord: vi.fn(),
  };
});

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    saveMindRecord: vi.fn(),
    loadMindRecord: vi.fn(),
  };
});

describe("updateRecord", () => {
  test("root", async () => {
    updateEntry.mockReset();

    saveMindRecord.mockReset();

    await updateRecord({}, "root", "mind", {});

    expect(updateMind).toHaveBeenCalledWith({}, {});

    expect(saveMindRecord).toHaveBeenCalledWith({}, {});
  });

  test("id", async () => {
    updateEntry.mockReset();

    saveMindRecord.mockReset();

    await updateRecord({}, stub.id, stub.trunk, {});

    expect(updateEntry).toHaveBeenCalledWith({}, stub.id, {});

    expect(saveMindRecord).not.toHaveBeenCalled();
  });
});

describe("createRecord", () => {
  newUUID.mockImplementation(() => stub.id);

  test("root", async () => {
    const record = await createRecord("root", "mind");

    expect(record).toStrictEqual({
      _: "mind",
      mind: stub.id,
      ...defaultMindRecord,
    });
  });

  test("id", async () => {
    const record = await createRecord(stub.id, stub.trunk);

    expect(record).toStrictEqual({ _: stub.trunk, [stub.trunk]: stub.id });
  });
});

describe("selectStream", () => {
  test("root", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    const api = {
      selectStream: vi
        .fn()
        .mockImplementationOnce(() => ({
          done: false,
          value: {},
        }))
        .mockImplementationOnce(() => ({
          done: true,
        })),
    };

    loadMindRecord.mockReset();

    loadMindRecord.mockImplementation(() => ({}));

    const { startStream } = await selectStream(
      api,
      stub.schema,
      "root",
      appendRecord,
      new URLSearchParams(testCase.queryString),
      0,
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();
  });

  test("id", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    const api = {
      selectStream: vi
        .fn()
        .mockImplementationOnce(() => ({
          done: false,
          value: {},
        }))
        .mockImplementationOnce(() => ({
          done: true,
        })),
    };

    loadMindRecord.mockReset();

    const { startStream } = await selectStream(
      api,
      stub.schema,
      stub.id,
      appendRecord,
      new URLSearchParams(testCase.queryString),
      0,
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();
  });
});
