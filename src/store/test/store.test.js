import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  onRecordSave,
  onRecordWipe,
  onSearch,
  onRecordCreate,
  updateSearchParams,
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

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    changeSearchParams: vi.fn(),
  };
});

const [store, setStore] = makeStore();

describe("store", () => {
  // restore after, not before
  // to keep initial state
  beforeEach(() => {
    setStore(undefined);

    changeSearchParams.mockReset();

    createRecord.mockReset();

    setStore({
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
      await onRecordEdit({ setStore }, ["record"], 1);

      expect(store.record).toStrictEqual(1);
    });
  });

  describe("onRecordCreate", () => {
    test("", async () => {
      createRecord.mockImplementation(() => 1);

      await onRecordCreate({ store, setStore });

      expect(createRecord).toHaveBeenCalledWith("root", "mind", {});

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

      expect(api.d).toHaveBeenCalledWith("root", recordOld);

      expect(api.u).toHaveBeenCalledWith("root", recordNew);

      expect(store.recordSet).toStrictEqual(["value2"]);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      const api = {
        d: vi.fn(() => 1),
      };

      await onRecordWipe({ store, setStore, api }, {});

      expect(api.d).toHaveBeenCalledWith("root", {});

      expect(store.recordSet).toStrictEqual([]);
    });
  });

  describe("updateSearchParams", () => {
    test("searches", async () => {
      const field = "a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      await updateSearchParams({ store, setStore }, field, value);

      expect(store.searchParams.toString()).toStrictEqual("1");

      // TODO do in proxy
      //expect(window.history.replaceState).toHaveBeenCalledWith(null, null, 2);
    });

    test("ignores evenor specific param", async () => {
      const field = ".a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      await updateSearchParams({ store, setStore }, field, value);

      expect(store.searchParams).toBe("1");

      // TODO actually check that it ignores
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

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=first"),
      );

      expect(getSortedRecords({ store })).toStrictEqual([record1, record2]);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("recordSet", [record1, record2]);

      setStore(
        "searchParams",
        new URLSearchParams(".sortBy=mind&.sortDirection=last"),
      );

      expect(getSortedRecords({ store })).toStrictEqual([record2, record1]);
    });
  });

  describe("getFilterQueries", () => {
    test("", async () => {
      expect(getFilterQueries({ store })).toStrictEqual([["_", "mind"]]);
    });
  });

  describe("getFilterOptions", () => {
    test("", async () => {
      expect(getFilterOptions({ store })).toStrictEqual(["name", "mind", "__"]);
    });
  });
});
