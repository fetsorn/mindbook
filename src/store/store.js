/* try to keep store interactions only in this file */
import parser from "search-query-parser";
import diff from "microdiff";
import { createStore, produce } from "solid-js/store";
import {
  sortCallback,
  changeSearchParams,
  searchParamsToQuery,
} from "@/store/pure.js";
import { createRecord } from "@/store/impure.js";
import { createContext } from "solid-js";

export const Context = createContext();

export function makeStore() {
  return createStore({
    abortPreviousStream: async () => {},
    searchParams: "_=mind", // sets the state of search bar
    mind: { _: "mind", mind: "root", name: "minds" },
    schema: {}, // TODO set schemaRoot somehow
    template: {},
    record: undefined,
    recordSet: [],
    recordMap: {},
    spoilerMap: {},
    loading: false,
    searchBar: "", // remembers the last state of search bar
  });
}

export function openBook({ setStore }, content) {
  setStore(
    produce((state) => {
      state.mind = content.mind;
      state.schema = content.schema;
      state.searchParams = content.searchParams;
      state.template = content.template;
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
  return new URLSearchParams(store.searchParams).get("_");
}

/**
 * This
 * @name getFilterOptions
 * @export function
 * @returns {String[]}
 */
export function getFilterOptions({ store }) {
  if (store.schema === undefined || store.searchParams === undefined) return [];

  // find all fields name
  const leafFields = store.schema[
    new URLSearchParams(store.searchParams).get("_")
  ].leaves.concat([new URLSearchParams(store.searchParams).get("_"), "__"]);

  // find field name which is added to filter search params
  const addedFields = Array.from(
    new URLSearchParams(store.searchParams).keys(),
  );

  // find name fields which is not added to filter search params
  const notAddedFields = leafFields.filter((key) => !addedFields.includes(key));

  return notAddedFields;
}

/**
 * This
 * @name getFilterQueries
 * @export function
 * @returns {String[]}
 */
export function getFilterQueries({ store }) {
  if (store.searchParams === undefined) return [];

  // convert entries iterator to array for Index
  return Array.from(new URLSearchParams(store.searchParams).entries()).filter(
    ([key]) => key !== ".sortDirection",
  );
}

/**
 * This
 * @name getSortedRecords
 * @export function
 * @returns {Function}
 */
export function getSortedRecords({ store }) {
  const sortBy = new URLSearchParams(store.searchParams).get(".sortBy");

  const sortDirection = new URLSearchParams(store.searchParams).get(
    ".sortDirection",
  );

  const records = store.recordSet.toSorted(sortCallback(sortBy, sortDirection));

  return records;
}

export async function onSearchBar({ store, setStore, api }, searchBar) {
  setStore(
    produce((state) => {
      state.searchBar = searchBar;
    }),
  );

  const options = {
    keywords: Object.keys(store.schema),
  };

  function objectize(q) {
    return typeof q === "string" ? { text: q } : q;
  }

  const searchBarOld = objectize(
    parser.parse(getSearchBar({ store }), options),
  );

  const searchBarNew = objectize(parser.parse(searchBar, options));

  // TODO: rename text to .text in fetsorn/search-query-parser
  const changes = diff(searchBarOld, searchBarNew, {
    cyclesFix: false,
    offsets: false,
  });

  // what if no change?
  // can there be no change on input? no, always returns field and value
  // can there be many changes? yes
  // in the most naive case we input a letter, and get that letter's
  // field and value
  // but what if the letter is plain text and must match multiple fields?
  const doSearch = batchUpdateSearchParams(context, changes);

  // no longer do search on change of search bar
  //if (doSearch) {
  //  await onSearch()
  //}
}

export function getSearchBar({ store }) {
  const searchParams = new URLSearchParams(store.searchParams);

  const options = {
    keywords: Object.keys(store.schema),
  };

  const searchBar = Array.from(searchParams.entries())
    .filter(([field, value]) => !field.startsWith(".") && field !== "_")
    .reduce((withEntry, [field, value]) => {
      return { ...withEntry, [field]: value };
    }, {});

  return parser.stringify(searchBar, options);
}

export function updateSearchParams({ store, setStore }, field, value) {
  // NOTE freeform text is not supported by csvs yet
  if (field !== "text") {
    const searchParams = changeSearchParams(
      new URLSearchParams(store.searchParams),
      field,
      value,
    );

    // TODO move to proxy somewhere
    //const url = makeURL(searchParams, store.mind.mind);
    //window.history.replaceState(null, null, url);

    // do not reset searchParams here to preserve focus on filter
    setStore(
      produce((state) => {
        state.searchParams = searchParams.toString();
      }),
    );

    return true;
  }

  return false;
}

// diff changes to store.searchParams
function batchUpdateSearchParams(context, changes) {
  // only search if some field was updated
  // don't search on freeform text
  let doSearch = false;

  changes
    .filter((c) => c.path[0] !== "exclude" && c.path[0] !== "offsets")
    .forEach((change) => {
      switch (change.type) {
        case "REMOVE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(context, field, undefined);

          break;
        }
        case "CREATE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(context, field, change.value);

          break;
        }
        case "CHANGE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(context, field, change.value);

          break;
        }
      }
    });

  return doSearch;
}

export async function onBase(context, value) {
  updateSearchParams(context, "_", value);

  //await onSearch()
}

export async function onSort(context, field, value) {
  updateSearchParams(context, field, value);

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
  const record = await createRecord(
    store.mind.mind,
    new URLSearchParams(store.searchParams).get("_"),
    store.template,
  );

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
  const base = getBase({ store });

  const grain = { _: base, [base]: record };

  if (store.recordMap[record] === undefined) {
    const recordNew = await api.describe(store.mind.mind, grain);

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
export async function onRecordSave(
  { store, setStore, api },
  recordOld,
  recordNew,
) {
  setStore("loading", true);

  const base = new URLSearchParams(store.searchParams).get("_");

  await api.d(store.mind.mind, recordOld);

  await api.u(store.mind.mind, recordNew);

  const keyOld = recordOld[base];

  const keyNew = recordNew[base];

  const records = store.recordSet.filter((r) => r !== keyOld).concat([keyNew]);

  // force reload
  setStore("recordSet", []);

  setStore("recordMap", { [keyNew]: recordNew });

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

  await api.d(store.mind.mind, record);

  const base = new URLSearchParams(store.searchParams).get("_");

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
    const searchParams = new URLSearchParams(store.searchParams);

    // remove all evenor-specific searchParams before passing to csvs
    const searchParamsWithoutCustom = new URLSearchParams(
      Array.from(searchParams.entries()).filter(
        ([key]) => !key.startsWith("."),
      ),
    );

    const query = searchParamsToQuery(store.schema, searchParamsWithoutCustom);

    const fromStrm = await api.r(store.mind.mind, query);

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

    setStore(
      produce((state) => {
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => () => {
          return abortPreviousStream();
        };
        // erase existing records
        state.recordSet = [];
      }),
    );

    // start appending records
    await fromStrm.pipeTo(toStrm, { signal: abortController.signal });

    // TODO does it stop main?
    for (const record of store.recordSet) {
      await getRecord({ store, setStore, api }, record);
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

  const scroll = new URLSearchParams(store.searchParams).get(".scroll");

  if (scroll !== null) {
    // SEC-16: null-check before calling scrollIntoView
    const element = document.getElementById(scroll);

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

  await onSearch(
    context,
    "_",
    new URLSearchParams(store.searchParams).get("_"),
  );

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

export async function onAction({ api }, action, record) {
  const actionRecord = {
    _: "action",
    action,
    record,
  };

  api.c(store.mind.mind, actionRecord);
}
