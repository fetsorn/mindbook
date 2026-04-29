import { describe, expect, test, afterEach, vi } from "vitest";
import {
  updateSearchParams,
  onRecordSave,
  onRecordWipe,
  onSearch,
  onMindChange,
  onRecordCreate,
} from "@/store/store.js";
import {
  getSpoilerOpen,
  setSpoilerOpen,
  onRecordEdit,
  appendRecord,
  getSortedRecords,
  getFilterQueries,
  getFilterOptions,
} from "@/query/store.js";
import { queryStore, setQueryStore } from "@/query/store.js";
import { proxyStore, setProxyStore } from "@/proxy/store.js";
import { changeSearchParams, makeURL } from "@/query/pure.js";
import { createRecord, selectStream } from "@/store/impure.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import schemaRoot from "@/store/default_root_schema.json";

vi.mock("@/store/action.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    saveRecord: vi.fn(),
    wipeRecord: vi.fn(),
    changeMind: vi.fn(),
  };
});

vi.mock("@/store/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    createRecord: vi.fn(),
    selectStream: vi.fn(),
  };
});

vi.mock("@/query/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    changeSearchParams: vi.fn(),
    makeURL: vi.fn(),
  };
});

describe("store", () => {
  // restore after, not before
  // to keep initial state
  afterEach(() => {
    setQueryStore(undefined);
    setProxyStore(undefined);

    changeSearchParams.mockReset();
    makeURL.mockReset();
    createRecord.mockReset();
    selectStream.mockReset();
    saveRecord.mockReset();
    wipeRecord.mockReset();
    changeMind.mockReset();

    setQueryStore({
      searchParams: new URLSearchParams("_=mind"),
      schema: schemaRoot,
      record: undefined,
      recordSet: [],
    });
    setProxyStore({
      abortPreviousStream: () => {},
      mind: { _: "mind", mind: "root", name: "minds" },
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

      expect(createRecord).toHaveBeenCalledWith("root", "mind");

      expect(queryStore.record).toStrictEqual(1);
    });
  });

  describe("onRecordSave", () => {
    test("", async () => {
      saveRecord.mockImplementation(() => 1);

      const api = {
        getOrigin: vi.fn(),
      };

      await onRecordSave(api, {}, {});

      expect(saveRecord).toHaveBeenCalledWith(api, "root", "mind", [], {}, {});

      expect(queryStore.recordSet).toStrictEqual(1);
    });
  });

  describe("onRecordWipe", () => {
    test("", async () => {
      wipeRecord.mockImplementation(() => 1);

      const api = {
        getOrigin: vi.fn(),
      };

      await onRecordWipe(api, {});

      expect(wipeRecord).toHaveBeenCalledWith(api, "root", "mind", [], {});

      expect(queryStore.recordSet).toStrictEqual(1);
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

      makeURL.mockImplementation(() => 2);

      await updateSearchParams(field, value);

      expect(queryStore.searchParams.toString()).toStrictEqual("1");

      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, 2);
    });

    test("ignores evenor specific param", async () => {
      const field = ".a";

      const value = "b";

      changeSearchParams.mockImplementation(() => "1");

      window.history.replaceState = vi.fn();

      makeURL.mockImplementation(() => 2);

      await updateSearchParams(field, value);

      expect(queryStore.searchParams).toBe("1");

      // TODO actually check that it ignores
    });
  });

  describe("onSearch", () => {
    test("searches", async () => {
      const startStream = vi.fn();

      selectStream.mockImplementation(() => ({
        abortPreviousStream: () => 3,
        startStream,
      }));

      const api = {
        appendRecord: vi.fn(),
      };

      await onSearch(api);

      expect(queryStore.recordSet).toStrictEqual([]);

      expect(startStream).toHaveBeenCalled();

      expect(selectStream).toHaveBeenCalled();

      expect(proxyStore.abortPreviousStream()()).toBe(3);
    });
  });

  describe("onMindChange", () => {
    test("", async () => {
      const mind = { _: "mind", mind: "id", name: "name" };

      changeMind.mockImplementation(async () => ({
        mind: mind,
        schema: 2,
        searchParams: 3,
      }));

      window.history.replaceState = vi.fn();

      makeURL.mockImplementation(() => 5);

      const api = {
        getOrigin: vi.fn(),
      };

      await onMindChange(api, "/", "_=mind");

      expect(proxyStore.mind).toStrictEqual(mind);

      expect(queryStore.schema).toStrictEqual(2);

      expect(queryStore.searchParams).toStrictEqual("3");
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
      expect(getFilterOptions()).toStrictEqual([
        "name",
        "category",
        "branch",
        "local_tag",
        "origin_url",
        "sync_tag",
        "mind",
        "__",
      ]);
    });
  });
});
