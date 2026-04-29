import parser from "search-query-parser";
import diff from "microdiff";
import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { sortCallback, changeSearchParams, makeURL } from "@/query/pure.js";
import { createRecord } from "@/query/impure.js";

export const QueryContext = createContext();

export const [queryStore, setQueryStore] = createStore({
  searchParams: "_=mind", // sets the state of search bar
  schema: {}, // TODO set schemaRoot somehow
  mind: { _: "mind", mind: "root", name: "minds" },
  record: undefined,
  recordSet: [],
  recordMap: {},
  spoilerMap: {},
  loading: false,
  template: {},
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
 * @name appendRecord
 * @export function
 * @param {object} record -
 */
export function appendRecord(record) {
  setQueryStore("recordSet", queryStore.recordSet.length, record);
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

    const url = makeURL(searchParams, queryStore.mind.mind);

    window.history.replaceState(null, null, url);

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
