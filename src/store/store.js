/* try to keep store interactions only in this file */
import { createStore, produce } from "solid-js/store";
import { sortCallback } from "@/store/pure.js";
import { createRecord } from "@/store/impure.js";
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
  });
}

export function openBook({ setStore }, content) {
  setStore(
    produce((state) => {
      state.recordSet = [];
      state.recordMap = {};
      state.record = undefined;
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

export async function getRecord({ store, setStore, api }, record) {
  const base = store.base;

  const grain = { _: base, [base]: record };

  if (store.recordMap[record] === undefined) {
    const [recordNew] = await Array.fromAsync(await api.describe(grain));

    setStore("recordMap", { [record]: recordNew });
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

/**
 * This lateral jumps
 * @name leapfrog
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function leapfrog(context, branch, value, cognate) {
  await onSearch(context, undefined, undefined);

  await onSearch(context, "_", store.base);

  await onSearch(context, "__", cognate);

  await onSearch(context, branch, value);
}

/**
 * This deep jumps
 * @name backflip
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function backflip(context, branch, value, cognate) {
  await onSearch(context, undefined, undefined);

  await onSearch(context, "_", cognate);

  await onSearch(context, "__", branch);

  await onSearch(context, cognate, value);
}

/**
 * This
 * @name sidestep
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function sidestep(context, branch, value, cognate) {
  await onSearch(context, undefined, undefined);

  await onSearch(context, "_", cognate);

  await onSearch(context, cognate, value);
}

/**
 * This side jumps
 * @name warp
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function warp(context, branch, value, cognate) {
  await onSearch(context, undefined, undefined);

  await onSearch(context, "_", store.schema[cognate].trunks[0]);

  await onSearch(context, "__", cognate);

  await onSearch(context, store.schema[cognate].trunks[0], value);
}

export async function onAction({ store, api }, action, record) {
  const actionRecord = {
    _: "action",
    action,
    record,
  };

  api.c(actionRecord);
}

export async function searchBook(context, base, query) {
  onBase(context, base);

  setQuery(context, query);

  await onSearch(context);
}
