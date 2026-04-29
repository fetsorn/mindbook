import { describe, expect, test, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import {
  newUUID,
  updateMind,
  updateEntry,
  deleteRecord,
  readSchema,
  createRoot,
} from "@/store/record.js";
import { saveMindRecord, loadMindRecord } from "@/proxy/record.js";
import {
  readRemoteTags,
  readLocalTags,
  writeRemoteTags,
  writeLocalTags,
} from "@/proxy/tags.js";
import { schemaToBranchRecords } from "@/query/pure.js";
import schemaRoot from "@/store/default_root_schema.json";
import stub from "./stub.js";

vi.mock("@/query/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/proxy/tags.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readRemoteTags: vi.fn(),
    readLocalTags: vi.fn(),
    writeRemoteTags: vi.fn(),
    writeLocalTags: vi.fn(),
  };
});

vi.mock("uuid", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    v4: vi.fn(() => "1"),
  };
});

describe("newUUID", () => {
  test("generates an id", () => {
    const uuid = newUUID();

    expect(uuidv4).toHaveBeenCalled();

    expect(uuid).toBe(
      "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b", // sha256 of "1"
    );
  });
});

describe("deleteRecord", () => {
  test("", async () => {
    const api = {
      deleteRecord: vi.fn(),
      commit: vi.fn(),
    };

    await deleteRecord(api, "mind", {});

    expect(api.deleteRecord).toHaveBeenCalledWith("mind", {});

    expect(api.commit).toHaveBeenCalledWith("mind");
  });
});

describe("updateMind", () => {
  test("", async () => {
    const api = {
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    await updateMind(api, {});

    expect(api.updateRecord).toHaveBeenCalledWith("root", {});

    expect(api.commit).toHaveBeenCalledWith("root");
  });
});

describe("updateEntry", () => {
  test("", async () => {
    const api = {
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    await updateEntry(api, "mind", {});

    expect(api.updateRecord).toHaveBeenCalledWith("mind", {});

    expect(api.commit).toHaveBeenCalledWith("mind");
  });
});

describe("readSchema", () => {
  test("root", async () => {
    const api = {};

    const schema = await readSchema(api, "root");

    expect(schema).toStrictEqual(schemaRoot);
  });

  test("id", async () => {
    const testCase = stub.cases.trunk;

    const api = {
      select: vi
        .fn()
        .mockImplementationOnce(() => [testCase.schemaRecord])
        .mockImplementationOnce(() => testCase.branchRecords),
    };

    const schema = await readSchema(api, stub.id);

    expect(api.select).toHaveBeenCalledWith(stub.id, { _: "_" });

    expect(api.select).toHaveBeenCalledWith(stub.id, { _: "branch" });

    expect(schema).toStrictEqual(testCase.schema);
  });
});

describe("createRoot", () => {
  test("", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    const testCase = stub.cases.trunk;

    schemaToBranchRecords.mockImplementation(() => testCase.branchRecords);

    await createRoot(api);

    expect(api.gitinit).toHaveBeenCalledWith("root");

    for (const branchRecord of testCase.branchRecords) {
      expect(api.updateRecord).toHaveBeenCalledWith("root", branchRecord);
    }

    expect(api.commit).toHaveBeenCalledWith("root");
  });
});

describe("saveMindRecord", () => {
  test("", async () => {
    const api = {
      gitinit: vi.fn(),
      csvsinit: vi.fn(),
      updateRecord: vi.fn(),
      commit: vi.fn(),
    };

    const testCase = stub.cases.tags;

    await saveMindRecord(api, testCase.record);

    expect(api.gitinit).toHaveBeenCalledWith(stub.id, stub.name);

    //expect(api.createLFS).toHaveBeenCalledWith(stub.id);

    expect(api.updateRecord).toHaveBeenCalledWith(
      stub.id,
      testCase.schemaRecord,
    );

    for (const metaRecord of testCase.metaRecords) {
      expect(api.updateRecord).toHaveBeenCalledWith(stub.id, metaRecord);
    }

    expect(writeRemoteTags).toHaveBeenCalledWith(api, stub.id, [
      testCase.originUrl,
    ]);

    //expect(writeLocalTags).toHaveBeenCalledWith(api, stub.id, [testCase.localTag]);

    expect(api.commit).toHaveBeenCalledWith(stub.id);
  });
});

describe("loadMindRecord", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const api = {
      select: vi
        .fn()
        .mockImplementationOnce(() => [testCase.schemaRecord])
        .mockImplementationOnce(() => testCase.branchRecords),
    };

    readRemoteTags.mockImplementation(() => [testCase.originUrl]);

    readLocalTags.mockImplementation(() => [testCase.localTag]);

    const record = await loadMindRecord(api, testCase.record);

    expect(record).toStrictEqual(testCase.record);
  });
});
