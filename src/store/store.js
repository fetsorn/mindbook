/* try to keep store interactions only in this file */
import { createStore, produce } from "solid-js/store";
import { sortCallback } from "@/store/pure.js";
import { createRecord } from "@/store/impure.js";
import { buildGraph, pickFoci, neighbours } from "@/store/chain.js";
import { createContext } from "solid-js";

export const Context = createContext();

export function makeStore() {
  return createStore({
    abortPreviousStream: async () => {},
    base: "mind",
    sortBy: "mind",
    sortDirection: undefined,
    scroll: undefined,
    query: "", // raw search bar text, source of truth
    schema: {},
    template: {},
    record: undefined,
    recordSet: [],
    recordMap: {},
    spoilerMap: {},
    actions: {},
    loading: false,
    chainBy: null,
    chainPins: new Set(),
  });
}

export function openBook({ setStore }, content) {
  setStore(
    produce((state) => {
      state.recordSet = [];
      state.recordMap = {};
      state.record = undefined;
      state.chainBy = null;
      state.chainPins = new Set();
    }),
  );

  setStore(
    produce((state) => {
      state.schema = content.schema;
      state.template = content.template;
      state.actions = content.actions;

      if (content.base !== undefined) state.base = content.base;
      if (content.sortBy !== undefined) state.sortBy = content.sortBy;
      if (content.sortDirection !== undefined)
        state.sortDirection = content.sortDirection;
      if (content.scroll !== undefined) state.scroll = content.scroll;
      if (content.query !== undefined) state.query = content.query;
    }),
  );
}

/**
 * This
 * @name getSpoilerOpen
 * @param {String} index -
 * @export function
 */
export function getSpoilerOpen({ store }, index) {
  return store.spoilerMap[index];
}

/**
 * This
 * @name setSpoilerOpen
 * @param {String} index -
 * @param {boolean} isOpen -
 * @export function
 */
export function setSpoilerOpen({ setStore }, index, isOpen) {
  setStore("spoilerMap", { [index]: isOpen });
}

/**
 * This
 * @name onRecordEdit
 * @export function
 * @param {String[]} path -
 * @param {String} value -
 */
export function onRecordEdit({ setStore }, path, value) {
  setStore(...path, value);
}

export function getBase({ store }) {
  return store.base;
}

/**
 * This
 * @name getSortedRecords
 * @export function
 * @returns {Function}
 */
export function getSortedRecords({ store }) {
  const records = store.recordSet.toSorted(
    sortCallback(store.sortBy, store.sortDirection),
  );

  return records;
}

/**
 * Set the raw search bar text. No parsing until search is triggered.
 * @param {string} query - raw search bar text
 */
export function setQuery({ setStore }, query) {
  setStore(
    produce((state) => {
      state.query = query;
    }),
  );
}

export function onBase(context, value) {
  context.setStore(
    produce((state) => {
      state.base = value;
      state.recordSet = [];
      state.recordMap = {};
      state.record = undefined;
    }),
  );
}

export function onSort(context, field, value) {
  context.setStore(
    produce((state) => {
      if (field === ".sortBy") state.sortBy = value;
      if (field === ".sortDirection") state.sortDirection = value;
    }),
  );

  context.setStore(
    produce((state) => {
      state.recordSet = getSortedRecords(context);
    }),
  );
}

/**
 * This
 * @name onRecordCreate
 * @export function
 */
export async function onRecordCreate({ store, setStore }) {
  const record = await createRecord(store.base, store.template);

  setStore(
    produce((state) => {
      state.record = record;
    }),
  );
}

export async function onCancel({ store, setStore }) {
  await store.abortPreviousStream();

  setStore("loading", false);
}

// Ensure branches with leaves are objects, not bare strings.
// If schema says "place" has leaves and the value is "new york",
// wrap it into { _: "place", place: "new york" }.
// move to csvs-js
function normalizeBranches(record, schema) {
  if (!schema || typeof record !== "object" || record === null) return record;

  for (const [key, value] of Object.entries(record)) {
    if (key === "_" || key.startsWith("@") || key === record._) continue;

    const branchSchema = schema[key];
    if (!branchSchema || branchSchema.leaves.length === 0) continue;

    if (Array.isArray(value)) {
      record[key] = value.map((item) =>
        typeof item === "string"
          ? { _: key, [key]: item }
          : normalizeBranches(item, schema),
      );
    } else if (typeof value === "string") {
      record[key] = { _: key, [key]: value };
    } else if (typeof value === "object" && value !== null) {
      normalizeBranches(value, schema);
    }
  }

  return record;
}

export async function getRecord({ store, setStore, api }, record) {
  const base = store.base;

  const grain = { _: base, [base]: record };

  if (store.recordMap[record] === undefined) {
    const [recordNew] = await Array.fromAsync(await api.describe(grain));

    setStore("recordMap", {
      [record]: normalizeBranches(recordNew, store.schema),
    });
  }

  const recordNew = store.recordMap[record];

  return recordNew;
}

/**
 * This
 * @name onRecordSave
 * @export function
 * @param {object} recordOld -
 * @param {object} recordNew -
 */
function stripEmptyProse(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripEmptyProse);

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("@") && value === "") continue;

    result[key] = stripEmptyProse(value);
  }

  return result;
}

export async function onRecordSave(
  { store, setStore, api },
  recordOld,
  recordNew,
) {
  setStore("loading", true);

  await store.abortPreviousStream();

  const base = store.base;

  const recordCleaned = stripEmptyProse(recordNew);

  try {
    await Array.fromAsync(await api.d(recordOld));
  } catch {
    // do nothing
  }

  await Array.fromAsync(await api.u(recordCleaned));

  const keyOld = recordOld[base];

  const keyNew = recordCleaned[base];

  const records = store.recordSet.filter((r) => r !== keyOld).concat([keyNew]);

  // force reload
  setStore("recordSet", []);

  setStore("recordMap", { [keyNew]: recordCleaned });

  setStore(
    produce((state) => {
      state.recordSet = records;
      state.record = undefined;
    }),
  );

  setStore("loading", false);
}

/**
 * This
 * @name onRecordWipe
 * @export function
 * @param {object} record -
 */
export async function onRecordWipe({ store, setStore, api }, record) {
  setStore("loading", true);

  await store.abortPreviousStream();

  await Array.fromAsync(await api.d(record));

  const base = store.base;

  const key = record[base];

  const records = store.recordSet.filter((r) => r !== key);

  setStore(
    produce((state) => {
      state.recordSet = records;
      state.recordMap[record] = undefined;
    }),
  );

  setStore("loading", false);
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch({ store, setStore, api }) {
  setStore("loading", true);

  try {
    const base = store.base;

    const fromStrm = await api.r(base, store.query);

    // prepare a controller to stop the new stream
    let isAborted = false;

    const abortController = new AbortController();

    function abortPreviousStream() {
      isAborted = true;

      abortController.abort();
    }

    // create a stream that appends to records
    const toStrm = new WritableStream({
      async write(chunk) {
        if (isAborted) {
          return;
        }

        const key = chunk[chunk._];

        // append record
        setStore("recordSet", store.recordSet.length, key);
      },

      abort() {
        // stream interrupted
      },
    });

    // stop previous stream
    await store.abortPreviousStream();

    // wrap in () => fn so solid stores the function instead of calling it
    setStore("abortPreviousStream", () => () => abortPreviousStream());

    setStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );

    // start appending records
    await fromStrm.pipeTo(toStrm, { signal: abortController.signal });

    // TODO replace with Intersection Observer
    if (!isAborted) {
      for (const record of store.recordSet) {
        if (isAborted) break;

        await getRecord({ store, setStore, api }, record);
      }
    }
  } catch (e) {
    console.error(e);

    setStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );
  }

  if (store.scroll !== undefined && store.scroll !== null) {
    const element = document.getElementById(store.scroll);

    if (element) {
      element.scrollIntoView();
    }
  }

  setStore("loading", false);
}

export async function onAction({ store, api }, action, record) {
  const actionRecord = {
    _: "action",
    action,
    record,
  };

  api.c(actionRecord);
}

// Chain graph getters: the view never imports chain.js. It reads
// the graph, foci and neighbours through these, so store.js stays
// the only boundary to the chain implementation. getChainGraph is
// meant to be wrapped in a memo by the caller (it rebuilds from
// recordSet); foci and neighbours then read off that one graph.
export function getChainGraph({ store }) {
  return buildGraph(store.recordSet, store.recordMap, store.chainBy);
}

export function getChainFoci({ store }, graph) {
  return [...pickFoci(graph.snapshot(), {}, store.chainPins)];
}

export function getChainNeighbours(_context, graph, focusKey) {
  return neighbours(graph, focusKey);
}

// Choose which branch to chain by. The graph and foci are
// derived in the view from chainBy + recordSet, so this only
// sets chainBy and clears the user's pins. Clearing pins is the
// whole reset: switching date -> datum -> place re-derives from
// scratch instead of accumulating.
export function onChain({ store, setStore }, value) {
  const chainBy = value || null;

  setStore(
    produce((state) => {
      state.chainBy = chainBy;
      state.chainPins = new Set();
    }),
  );
}

// Centre a component on the neighbour the user clicked. oldFocusKey
// and newFocusKey are in the same component, so replacing one with
// the other keeps exactly one pin per component. Only present
// records are ever shown as neighbours, so there is nothing to load.
export function onChainRecenter({ store, setStore }, oldFocusKey, newFocusKey) {
  setStore(
    produce((state) => {
      const next = new Set(state.chainPins);

      next.delete(oldFocusKey);
      next.add(newFocusKey);

      state.chainPins = next;
    }),
  );
}

export async function searchBook(context, base, query) {
  onBase(context, base);

  setQuery(context, query);

  await onSearch(context);
}
