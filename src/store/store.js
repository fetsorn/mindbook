/* try to keep store interactions only in this file */
import { createStore, produce } from "solid-js/store";
import { sortCallback } from "@/store/pure.js";
import { createRecord } from "@/store/impure.js";
import { sonKeys, normalizeBranches, visibleProseKeys } from "@/store/pure.js";
export { visibleProseKeys };
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
    editingKey: undefined, // stable key snapshot — never mutated during edit
    recordSet: [],
    recordMap: {},
    spoilerMap: {},
    actions: {},
    loading: false,
    chainBy: null,
    focus: null, // key of the focused record, or null
    // ego network: populated by queries when focus + chainBy are set
    egoCauses: [], // records the focus points to (outlinks)
    egoResults: [], // records pointing to the focus (inlinks)
  });
}

export function branchTitle(schema, branch, locale) {
  return schema[branch]?.description?.[locale] ?? branch;
}

export function openBook({ setStore }, content) {
  setStore(
    produce((state) => {
      state.recordSet = [];
      state.recordMap = {};
      state.record = undefined;
      state.editingKey = undefined;
      state.chainBy = null;
      state.focus = null;
      state.egoCauses = [];
      state.egoResults = [];
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

  // Entering or leaving edit mode — snapshot the key for stable identity
  if (path.length === 1 && path[0] === "record") {
    setStore("editingKey", value ? value[value._] : undefined);
  }
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
      state.editingKey = undefined;
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
      state.editingKey = record[record._];
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

    // A bare grain ({ _: base, [base]: key }) echoed back by describe
    // means no real record exists — treat as not found.
    const hasContent =
      recordNew &&
      Object.keys(recordNew).some((k) => k !== "_" && k !== base);

    setStore("recordMap", {
      [record]: hasContent
        ? normalizeBranches(recordNew, store.schema)
        : undefined,
    });
  }

  const recordNew = store.recordMap[record];

  return recordNew;
}

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

/**
 * This
 * @name onRecordSave
 * @export function
 * @param {object} recordOld -
 * @param {object} recordNew -
 */
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

  const idx = store.recordSet.indexOf(keyOld);

  const records = idx >= 0
    ? store.recordSet.with(idx, keyNew)
    : [...store.recordSet, keyNew];

  // force reload
  setStore("recordSet", []);

  setStore("recordMap", { [keyNew]: recordCleaned });

  setStore(
    produce((state) => {
      state.recordSet = records;
      state.record = undefined;
      state.editingKey = undefined;
    }),
  );

  setStore("loading", false);

  queueMicrotask(() => {
    const el = document.getElementById(keyNew);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
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

    const fromStrm = await api.r(base, store.query, { register: true });

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

    // Records are hydrated lazily by IntersectionObserver
    // in OverviewItem as they scroll into view.

    // validate focus: if the focused key is not in the new
    // result set, clear it — focus is subordinate to query
    if (store.focus !== null && !store.recordSet.includes(store.focus)) {
      setStore(
        produce((state) => {
          state.focus = null;
          state.egoCauses = [];
          state.egoResults = [];
        }),
      );
    } else if (store.focus !== null && store.chainBy !== null) {
      // focus survived the search and chainBy is set — refresh ego
      await queryEgoNetwork({ store, setStore, api });
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

// -- Focus: set the centered record
//
// When the key is in the current recordSet, focus is set
// directly. When it's not (e.g. clicking a shadow node
// from a filtered feed), a search for that key is run so
// the feed navigates to include it.
//
// When both focus and chainBy are set, the ego network
// is queried from the dataset: causes (outlinks) from
// the focus record itself, results (inlinks) via a
// search for records whose chainBy value equals the
// focus key.

export async function setFocus({ store, setStore, api }, key) {
  if (key === null) {
    setStore(
      produce((state) => {
        state.focus = null;
        state.egoCauses = [];
        state.egoResults = [];
      }),
    );

    return;
  }

  // key not in current results — search for it
  if (!store.recordSet.includes(key)) {
    const base = store.base;

    setStore(
      produce((state) => {
        state.focus = key;
        state.egoCauses = [];
        state.egoResults = [];
        state.query = `${base}:${key}`;
      }),
    );

    await onSearch({ store, setStore, api });

    return;
  }

  setStore(
    produce((state) => {
      state.focus = key;
      state.egoCauses = [];
      state.egoResults = [];
    }),
  );

  if (store.chainBy !== null) {
    await queryEgoNetwork({ store, setStore, api });
  }
}

// Choose which branch to chain by. When chainBy changes
// and a focus is set, re-query the ego network along the
// new axis.
export async function onChain({ store, setStore, api }, value) {
  const chainBy = value || null;

  setStore(
    produce((state) => {
      state.chainBy = chainBy;
      state.egoCauses = [];
      state.egoResults = [];
    }),
  );

  if (chainBy !== null && store.focus !== null) {
    await queryEgoNetwork({ store, setStore, api });
  }
}

// Query the ego network of the current focus along the
// current chainBy axis.
//
// Two queries:
//   1. DESCRIBE focus → read its chainBy targets (causes)
//   2. SELECT where chainBy = focusKey → inlinks (results)
//
// The dataset answers both without needing a pre-built graph.
async function queryEgoNetwork({ store, setStore, api }) {
  const { base, focus, chainBy } = store;

  if (!focus || !chainBy) return;

  // 1. Get the focus record (may already be hydrated via recordMap)
  const focusRecord = await getRecord({ store, setStore, api }, focus);

  // Causes: records the focus points to via chainBy.
  // Only keep keys that resolve to actual records in the dataset —
  // plain-word values (e.g. "father") are silently dropped.
  const rawCauseKeys = sonKeys(focusRecord, chainBy);
  const causeKeys = [];

  for (const causeKey of rawCauseKeys) {
    try {
      const rec = await getRecord({ store, setStore, api }, causeKey);
      if (rec) causeKeys.push(causeKey);
    } catch {
      // not a record in the dataset — skip
    }
  }

  // 2. Results: records whose chainBy value equals focus
  //    Query as "chainBy:focusKey" — evenor parses keyword:value
  const resultKeys = [];

  try {
    const queryString = `${chainBy}:${focus}`;

    const resultStream = await api.r(base, queryString);

    const resultRecords = await Array.fromAsync(resultStream);

    for (const record of resultRecords) {
      const key = record[record._];

      // don't include focus itself as a result
      if (key !== focus) {
        resultKeys.push(key);

        // cache in recordMap
        if (store.recordMap[key] === undefined) {
          setStore("recordMap", {
            [key]: normalizeBranches(record, store.schema),
          });
        }
      }
    }
  } catch {
    // query failed — leave results empty
  }

  setStore(
    produce((state) => {
      state.egoCauses = causeKeys;
      state.egoResults = resultKeys;
    }),
  );
}

export async function searchBook(context, base, query) {
  onBase(context, base);

  setQuery(context, query);

  await onSearch(context);
}
