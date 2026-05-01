/* try to keep store interactions only in this file */
import parser from "search-query-parser";
import diff from "microdiff";
import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  sortCallback,
  changeSearchParams,
  searchParamsToQuery,
} from "@/query/pure.js";
import { createRecord } from "@/query/impure.js";

export const QueryContext = createContext();

export const [queryStore, setQueryStore] = createStore({
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

/**
 * This
 * @name getSpoilerOpen
 * @param {String} index -
 * @export function
 */
export function getSpoilerOpen(index) {
  return queryStore.spoilerMap[index];
}

/**
 * This
 * @name setSpoilerOpen
 * @param {String} index -
 * @param {boolean} isOpen -
 * @export function
 */
export function setSpoilerOpen(index, isOpen) {
  setQueryStore("spoilerMap", { [index]: isOpen });
}

/**
 * This
 * @name onRecordEdit
 * @export function
 * @param {String[]} path -
 * @param {String} value -
 */
export function onRecordEdit(path, value) {
  setQueryStore(...path, value);
}

export function getBase() {
  return new URLSearchParams(queryStore.searchParams).get("_");
}

/**
 * This
 * @name getFilterOptions
 * @export function
 * @returns {String[]}
 */
export function getFilterOptions() {
  if (queryStore.schema === undefined || queryStore.searchParams === undefined)
    return [];

  // find all fields name
  const leafFields = queryStore.schema[
    new URLSearchParams(queryStore.searchParams).get("_")
  ].leaves.concat([
    new URLSearchParams(queryStore.searchParams).get("_"),
    "__",
  ]);

  // find field name which is added to filter search params
  const addedFields = Array.from(
    new URLSearchParams(queryStore.searchParams).keys(),
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
export function getFilterQueries() {
  if (queryStore.searchParams === undefined) return [];

  // convert entries iterator to array for Index
  return Array.from(
    new URLSearchParams(queryStore.searchParams).entries(),
  ).filter(([key]) => key !== ".sortDirection");
}

/**
 * This
 * @name getSortedRecords
 * @export function
 * @returns {Function}
 */
export function getSortedRecords() {
  const sortBy = new URLSearchParams(queryStore.searchParams).get(".sortBy");

  const sortDirection = new URLSearchParams(queryStore.searchParams).get(
    ".sortDirection",
  );

  const records = queryStore.recordSet.toSorted(
    sortCallback(sortBy, sortDirection),
  );

  return records;
}

export async function onSearchBar(searchBar) {
  setQueryStore(
    produce((state) => {
      state.searchBar = searchBar;
    }),
  );

  const options = {
    keywords: Object.keys(queryStore.schema),
  };

  function objectize(q) {
    return typeof q === "string" ? { text: q } : q;
  }

  const searchBarOld = objectize(parser.parse(getSearchBar(), options));

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
  const doSearch = batchUpdateSearchParams(changes);

  // no longer do search on change of search bar
  //if (doSearch) {
  //  await onSearch()
  //}
}

export function getSearchBar() {
  const searchParams = new URLSearchParams(queryStore.searchParams);

  const options = {
    keywords: Object.keys(queryStore.schema),
  };

  const searchBar = Array.from(searchParams.entries())
    .filter(([field, value]) => !field.startsWith(".") && field !== "_")
    .reduce((withEntry, [field, value]) => {
      return { ...withEntry, [field]: value };
    }, {});

  return parser.stringify(searchBar, options);
}

export function updateSearchParams(field, value) {
  // NOTE freeform text is not supported by csvs yet
  if (field !== "text") {
    const searchParams = changeSearchParams(
      new URLSearchParams(queryStore.searchParams),
      field,
      value,
    );

    // TODO move to proxy somewhere
    //const url = makeURL(searchParams, queryStore.mind.mind);
    //window.history.replaceState(null, null, url);

    // do not reset searchParams here to preserve focus on filter
    setQueryStore(
      produce((state) => {
        state.searchParams = searchParams.toString();
      }),
    );

    return true;
  }

  return false;
}

// diff changes to queryStore.searchParams
function batchUpdateSearchParams(changes) {
  // only search if some field was updated
  // don't search on freeform text
  let doSearch = false;

  changes
    .filter((c) => c.path[0] !== "exclude" && c.path[0] !== "offsets")
    .forEach((change) => {
      switch (change.type) {
        case "REMOVE": {
          const field = change.path[0];

          doSearch = doSearch ? doSearch : updateSearchParams(field, undefined);

          break;
        }
        case "CREATE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(field, change.value);

          break;
        }
        case "CHANGE": {
          const field = change.path[0];

          doSearch = doSearch
            ? doSearch
            : updateSearchParams(field, change.value);

          break;
        }
      }
    });

  return doSearch;
}

export async function onBase(value) {
  updateSearchParams("_", value);

  //await onSearch()
}

export async function onSort(field, value) {
  updateSearchParams(field, value);

  setQueryStore(
    produce((state) => {
      state.recordSet = getSortedRecords();
    }),
  );
}

/**
 * This
 * @name onRecordCreate
 * @export function
 */
export async function onRecordCreate() {
  const record = await createRecord(
    queryStore.mind.mind,
    new URLSearchParams(queryStore.searchParams).get("_"),
    queryStore.template,
  );

  setQueryStore(
    produce((state) => {
      state.record = record;
    }),
  );
}

export async function onCancel() {
  await queryStore.abortPreviousStream();

  setQueryStore("loading", false);
}

export async function getRecord(api, record) {
  const base = getBase();

  const grain = { _: base, [base]: record };

  if (queryStore.recordMap[record] === undefined) {
    const recordNew = await api.describe(queryStore.mind.mind, grain);

    setQueryStore("recordMap", { [record]: recordNew });
  }

  const recordNew = queryStore.recordMap[record];

  return recordNew;
}

/**
 * This
 * @name onRecordSave
 * @export function
 * @param {object} recordOld -
 * @param {object} recordNew -
 */
export async function onRecordSave(api, recordOld, recordNew) {
  setQueryStore("loading", true);

  const base = new URLSearchParams(queryStore.searchParams).get("_");

  await api.d(queryStore.mind.mind, recordOld);

  await api.u(queryStore.mind.mind, recordNew);

  const keyOld = recordOld[base];

  const keyNew = recordNew[base];

  const records = queryStore.recordSet
    .filter((r) => r !== keyOld)
    .concat([keyNew]);

  // force reload
  setQueryStore("recordSet", []);

  setQueryStore("recordMap", { [keyNew]: recordNew });

  setQueryStore(
    produce((state) => {
      state.recordSet = records;
      state.record = undefined;
    }),
  );

  setQueryStore("loading", false);
}

/**
 * This
 * @name onRecordWipe
 * @export function
 * @param {object} record -
 */
export async function onRecordWipe(api, record) {
  setQueryStore("loading", true);

  await api.d(queryStore.mind.mind, record);

  const base = new URLSearchParams(queryStore.searchParams).get("_");

  const key = record[base];

  const records = queryStore.recordSet.filter((r) => r !== key);

  setQueryStore(
    produce((state) => {
      state.recordSet = records;
      state.recordMap[record] = undefined;
    }),
  );

  setQueryStore("loading", false);
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch(api) {
  setQueryStore("loading", true);

  try {
    const searchParams = new URLSearchParams(queryStore.searchParams);

    // remove all evenor-specific searchParams before passing to csvs
    const searchParamsWithoutCustom = new URLSearchParams(
      Array.from(searchParams.entries()).filter(
        ([key]) => !key.startsWith("."),
      ),
    );

    const query = searchParamsToQuery(
      queryStore.schema,
      searchParamsWithoutCustom,
    );

    const fromStrm = await api.r(queryStore.mind.mind, query);

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
        setQueryStore("recordSet", queryStore.recordSet.length, key);
      },

      abort() {
        // stream interrupted
      },
    });

    // stop previous stream
    await queryStore.abortPreviousStream();

    setQueryStore(
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
    for (const record of queryStore.recordSet) {
      await getRecord(api, record);
    }
  } catch (e) {
    console.error(e);

    setQueryStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );
  }

  const scroll = new URLSearchParams(queryStore.searchParams).get(".scroll");

  if (scroll !== null) {
    // SEC-16: null-check before calling scrollIntoView
    const element = document.getElementById(scroll);

    if (element) {
      element.scrollIntoView();
    }
  }

  setQueryStore("loading", false);
}

/**
 * This lateral jumps
 * @name leapfrog
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function leapfrog(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(
    api,
    "_",
    new URLSearchParams(queryStore.searchParams).get("_"),
  );

  await onSearch(api, "__", cognate);

  await onSearch(api, branch, value);
}

/**
 * This deep jumps
 * @name backflip
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function backflip(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", cognate);

  await onSearch(api, "__", branch);

  await onSearch(api, cognate, value);
}

/**
 * This
 * @name sidestep
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function sidestep(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", cognate);

  await onSearch(api, cognate, value);
}

/**
 * This side jumps
 * @name warp
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function warp(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", queryStore.schema[cognate].trunks[0]);

  await onSearch(api, "__", cognate);

  await onSearch(api, queryStore.schema[cognate].trunks[0], value);
}

export async function onAction(api, action, record) {
  const actionRecord = {
    _: "action",
    action,
    record,
  };

  api.c(queryStore.mind.mind, actionRecord);
}
