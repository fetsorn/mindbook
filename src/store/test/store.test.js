import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  onRecordSave,
  onRecordWipe,
  onSearch,
  onRecordCreate,
  setQuery,
  getSpoilerOpen,
  setSpoilerOpen,
  onRecordEdit,
  getSortedRecords,
  setFocus,
  onChain,
  makeStore,
} from "@/store/store.js";
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
      query: "",
      schema: stub.schemaRoot,
      record: undefined,
      recordSet: [],
      mind: { _: "mind", mind: "root", name: "minds" },
      abortPreviousStream: () => {},
      chainBy: null,
      focus: null,
      egoCauses: [],
      egoResults: [],
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
        c: vi.fn(),
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

      expect(getSortedRecords({ store })).toStrictEqual([record1, record2]);
    });

    test("sorts ascending", async () => {
      const record1 = { _: "mind", mind: "id1" };

      const record2 = { _: "mind", mind: "id2" };

      setStore("recordSet", [record1, record2]);

      setStore("sortDirection", "last");

      expect(getSortedRecords({ store })).toStrictEqual([record2, record1]);
    });
  });

  describe("setFocus", () => {
    test("sets focus when key is in recordSet", async () => {
      setStore("recordSet", ["father", "me", "son"]);

      const api = {
        describe: vi.fn(() => []),
        r: vi.fn(() => new ReadableStream({
          start(controller) { controller.close(); }
        })),
      };

      await setFocus({ store, setStore, api }, "father");

      expect(store.focus).toBe("father");
    });

    test("searches when key is not in recordSet", async () => {
      setStore("recordSet", ["me", "son"]);
      setStore("base", "mind");

      const api = {
        r: vi.fn(() => new ReadableStream({
          start(controller) {
            controller.enqueue({ _: "mind", mind: "father" });
            controller.close();
          }
        })),
        describe: vi.fn(() => [{ _: "mind", mind: "father" }]),
      };

      await setFocus({ store, setStore, api }, "father");

      // focus is set, and a search was triggered
      expect(store.focus).toBe("father");
      expect(store.query).toBe("mind:father");
      expect(api.r).toHaveBeenCalled();
    });

    test("clears focus when set to null", async () => {
      setStore("focus", "father");
      setStore("egoCauses", ["granma"]);
      setStore("egoResults", ["me"]);

      const api = {};

      await setFocus({ store, setStore, api }, null);

      expect(store.focus).toBe(null);
      expect(store.egoCauses).toStrictEqual([]);
      expect(store.egoResults).toStrictEqual([]);
    });
  });

  describe("ego network", () => {
    test("excludes causes when describe returns empty", async () => {
      setStore("recordSet", ["me"]);
      setStore("base", "mind");
      setStore("chainBy", "name");
      setStore("recordMap", {
        me: { _: "mind", mind: "me", name: "study of being" },
      });

      const api = {
        describe: vi.fn(() => []),
        r: vi.fn(() => new ReadableStream({
          start(controller) { controller.close(); }
        })),
      };

      await setFocus({ store, setStore, api }, "me");

      expect(store.focus).toBe("me");
      expect(store.egoCauses).toStrictEqual([]);
    });

    test("excludes causes when describe echoes back the grain", async () => {
      // api.describe may return the bare grain { _: "mind", mind: "study of being" }
      // even though no such record exists — getRecord caches it and
      // returns a truthy object, so the cause slips through
      setStore("recordSet", ["me"]);
      setStore("base", "mind");
      setStore("chainBy", "name");
      setStore("recordMap", {
        me: { _: "mind", mind: "me", name: "study of being" },
      });

      const api = {
        // describe echoes back the grain with no extra fields
        describe: vi.fn(() => [{ _: "mind", mind: "study of being" }]),
        r: vi.fn(() => new ReadableStream({
          start(controller) { controller.close(); }
        })),
      };

      await setFocus({ store, setStore, api }, "me");

      expect(store.focus).toBe("me");
      // "study of being" must NOT appear as a cause — it's not a real record
      expect(store.egoCauses).toStrictEqual([]);
    });

    test("includes causes that are real records", async () => {
      setStore("recordSet", ["son"]);
      setStore("base", "mind");
      setStore("chainBy", "parent");
      setStore("recordMap", {
        son: { _: "mind", mind: "son", parent: "father" },
      });

      const api = {
        // describe for "father" returns a full record
        describe: vi.fn(() => [
          { _: "mind", mind: "father", parent: "grandpa" },
        ]),
        // inlink query returns nothing
        r: vi.fn(() => new ReadableStream({
          start(controller) { controller.close(); }
        })),
      };

      await setFocus({ store, setStore, api }, "son");

      expect(store.focus).toBe("son");
      expect(store.egoCauses).toStrictEqual(["father"]);
    });
  });

  describe("onChain", () => {
    test("sets chainBy", async () => {
      const api = {};

      await onChain({ store, setStore, api }, "parent");

      expect(store.chainBy).toBe("parent");
    });

    test("clears chainBy with empty string", async () => {
      setStore("chainBy", "parent");

      const api = {};

      await onChain({ store, setStore, api }, "");

      expect(store.chainBy).toBe(null);
    });
  });
});
