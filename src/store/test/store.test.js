import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  onRecordSave,
  onRecordWipe,
  onSearch,
  onRecordCreate,
  updateSearchParams,
  setQuery,
  getSpoilerOpen,
  setSpoilerOpen,
  onRecordEdit,
  getSortedRecords,
  getFilterQueries,
  getFilterOptions,
  makeStore,
} from "@/store/store.js";
import { changeSearchParams } from "@/store/pure.js";
import { createRecord } from "@/store/impure.js";
import stub from "./stub.js";

vi.mock("@/store/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    createRecord: vi.fn(),
  };
});

const [store, setStore] = makeStore();

describe("store", () => {
  // restore after, not before
  // to keep initial state
  beforeEach(() => {
    setStore(undefined);

    createRecord.mockReset();

    setStore({
      searchParams: "_=mind&.sortBy=mind",
      query: "",
      schema: stub.schemaRoot,
      record: undefined,
      recordSet: [],
      mind: { _: "mind", mind: "root", name: "minds" },
      abortPreviousStream: () => {},
    });
  });

  describe("onRecordEdit", () => {
    test("", async () => {
      await onRecordEdit({ setStore }, ["record"], 1);

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordCreate", () => {
    test("", async () => {
      createRecord.mockImplementation(() => 1);

      await onRecordCreate({ store, setStore });

      expect(createRecord).toHaveBeenCalledWith("mind", {});

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      setStore("recordSet", ["value1"]);

      const api = {
        u: vi.fn(() => 1),
        d: vi.fn(() => 1),
      };

      const recordOld = { _: "mind", mind: "value1" };

      const recordNew = { _: "mind", mind: "value2" };

      await onRecordSave({ store, setStore, api }, recordOld, recordNew);

      expect(api.d).toHaveBeenCalledWith(recordOld);

      expect(api.u).toHaveBeenCalledWith(recordNew);

      expect(store.recordSet).toStrictEqual(["value2"]);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      const api = {
        d: vi.fn(() => 1),
      };

      await onRecordWipe({ store, setStore, api }, {});

      expect(api.d).toHaveBeenCalledWith({});

      expect(store.recordSet).toStrictEqual([]);
    });
  });

  describe("updateSearchParams", () => {
    test("sets a field", () => {
      updateSearchParams({ store, setStore }, "name", "foo");

      const params = new URLSearchParams(store.searchParams);

      expect(params.get("name")).toBe("foo");
      expect(params.get("_")).toBe("mind");
    });
  });

  describe("setQuery", () => {
    test("sets raw query text", () => {
      setQuery({ setStore }, "hello date:2024");

      expect(store.query).toBe("hello date:2024");
    });
  });

  describe("onSearch", () => {
    test("searches", async () => {
      const api = {
        r: vi.fn(() => ({ done: "ok", value: {} })),
      };

      await onSearch({ store, setStore, api });

      expect(store.recordSet).toStrictEqual([]);

      expect(api.r).toHaveBeenCalled();
    });
  });

  describe("getSpoilerOpen", () => {
    test("undefined at first", async () => {
      expect(getSpoilerOpen({ store }, "a")).toBe(undefined);
    });

    test("gets true", async () => {
      setStore("spoilerMap", "a", true);

      expect(getSpoilerOpen({ store }, "a")).toBe(true);
    });
  });

  describe("setSpoilerOpen", () => {
    test("sets true", async () => {
      setStore("spoilerMap", "a", false);

      setSpoilerOpen({ store, setStore }, "a", true);

      expect(store.spoilerMap["a"]).toBe(true);
    });
  });

  describe("getSortedRecords", () => {
    test("sorts descending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("recordSet", [record1, record2]);

      setStore("searchParams", "_=mind&.sortBy=mind&.sortDirection=first");

      expect(getSortedRecords({ store })).toStrictEqual([record1, record2]);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("recordSet", [record1, record2]);

      setStore("searchParams", "_=mind&.sortBy=mind&.sortDirection=last");

      expect(getSortedRecords({ store })).toStrictEqual([record2, record1]);
    });
  });

  describe("getFilterQueries", () => {
    test("", async () => {
      expect(getFilterQueries({ store })).toStrictEqual([["_", "mind"]]);
    });
  });

  // NOTE: getFilterOptions reads leaves from searchParams base, which is still valid

  describe("getFilterOptions", () => {
    test("", async () => {
      expect(getFilterOptions({ store })).toStrictEqual(["name", "mind", "__"]);
    });
  });
});
