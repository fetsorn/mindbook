import { describe, expect, test, beforeEach, vi } from "vitest";
import { onRecordSave, onRecordWipe, onSearch } from "@/query/store.js";
import {
  onRecordCreate,
  updateSearchParams,
  getSpoilerOpen,
  setSpoilerOpen,
  onRecordEdit,
  appendRecord,
  getSortedRecords,
  getFilterQueries,
  getFilterOptions,
} from "@/query/store.js";
import { queryStore, setQueryStore } from "@/query/store.js";
import { changeSearchParams } from "@/query/pure.js";
import { createRecord } from "@/query/impure.js";
import stub from "./stub.js";

vi.mock("@/query/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    createRecord: vi.fn(),
  };
});

vi.mock("@/query/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    changeSearchParams: vi.fn(),
  };
});

describe("store", () => {
  // restore after, not before
  // to keep initial state
  beforeEach(() => {
    setQueryStore(undefined);

    changeSearchParams.mockReset();
    createRecord.mockReset();

    setQueryStore({
      searchParams: new URLSearchParams("_=mind"),
      schema: stub.schemaRoot,
      record: undefined,
      recordSet: [],
      mind: { _: "mind", mind: "root", name: "minds" },
      abortPreviousStream: () => {},
    });
  });

  describe("onRecordEdit", () => {
    test("", async () => {
      await onRecordEdit(["record"], 1);

      expect(queryStore.record).toStrictEqual(1);
    });
  });

  describe("onRecordCreate", () => {
    test("", async () => {
      createRecord.mockImplementation(() => 1);

      await onRecordCreate();

      expect(createRecord).toHaveBeenCalledWith("root", "mind", {});

      expect(queryStore.record).toStrictEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      setQueryStore("recordSet", ["value1"]);

      const api = {
        crud: {
          u: vi.fn(() => 1),
          d: vi.fn(() => 1),
        },
        getOrigin: vi.fn(),
      };

      const recordOld = { _: "mind", mind: "value1" };

      const recordNew = { _: "mind", mind: "value2" };

      await onRecordSave(api, recordOld, recordNew);

      expect(api.crud.d).toHaveBeenCalledWith("root", recordOld);

      expect(api.crud.u).toHaveBeenCalledWith("root", recordNew);

      expect(queryStore.recordSet).toStrictEqual(["value2"]);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      const api = {
        crud: {
          d: vi.fn(() => 1),
        },
        getOrigin: vi.fn(),
      };

      await onRecordWipe(api, {});

      expect(api.crud.d).toHaveBeenCalledWith("root", {});

      expect(queryStore.recordSet).toStrictEqual([]);
    });
  });

  describe("appendRecord", () => {
    test("", async () => {
      appendRecord({});

      expect(queryStore.recordSet).toStrictEqual([{}]);
    });
  });

  describe("updateSearchParams", () => {
    test("searches", async () => {
      const field = "a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      await updateSearchParams(field, value);

      expect(queryStore.searchParams.toString()).toStrictEqual("1");

      // TODO do in proxy
      //expect(window.history.replaceState).toHaveBeenCalledWith(null, null, 2);
    });

    test("ignores evenor specific param", async () => {
      const field = ".a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      await updateSearchParams(field, value);

      expect(queryStore.searchParams).toBe("1");

      // TODO actually check that it ignores
    });
  });

  describe("onSearch", () => {
    test("searches", async () => {
      const api = {
        crud: {
          r: vi.fn(() => ({ done: "ok", value: {} })),
        },
        appendRecord: vi.fn(),
      };

      await onSearch(api);

      expect(queryStore.recordSet).toStrictEqual([]);

      expect(api.crud.r).toHaveBeenCalled();
    });
  });

  describe("getSpoilerOpen", () => {
    test("undefined at first", async () => {
      expect(getSpoilerOpen("a")).toBe(undefined);
    });

    test("gets true", async () => {
      setQueryStore("spoilerMap", "a", true);

      expect(getSpoilerOpen("a")).toBe(true);
    });
  });

  describe("setSpoilerOpen", () => {
    test("sets true", async () => {
      setQueryStore("spoilerMap", "a", false);

      setSpoilerOpen("a", true);

      expect(queryStore.spoilerMap["a"]).toBe(true);
    });
  });

  describe("getSortedRecords", () => {
    test("sorts descending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setQueryStore("recordSet", [record1, record2]);

      setQueryStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=first"),
      );

      expect(getSortedRecords()).toStrictEqual([record1, record2]);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setQueryStore("recordSet", [record1, record2]);

      setQueryStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=last"),
      );

      expect(getSortedRecords()).toStrictEqual([record2, record1]);
    });
  });

  describe("getFilterQueries", () => {
    test("", async () => {
      expect(getFilterQueries()).toStrictEqual([["_", "mind"]]);
    });
  });

  describe("getFilterOptions", () => {
    test("", async () => {
      expect(getFilterOptions()).toStrictEqual(["name", "mind", "__"]);
    });
  });
});
