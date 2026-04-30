/* try to keep store interactions only in this file */
import parser from "search-query-parser";
import diff from "microdiff";
import { getDefaultBase, makeURL } from "@/query/pure.js";
import { produce } from "solid-js/store";
import { buildRecord } from "@/proxy/impure.js";
import { selectStream } from "@/store/impure.js";
import { resolve, createRoot } from "@/proxy/record.js";
import { readSchema } from "@/store/record.js";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import { proxyStore, setProxyStore } from "@/proxy/store.js";
import {
  queryStore,
  setQueryStore,
  appendRecord,
  getSortedRecords,
} from "@/query/store.js";

export async function getRecord(api, record) {
  const base = getBase();

  const grain = { _: base, [base]: record };

  if (queryStore.recordMap[record] === undefined) {
    const recordNew = await buildRecord(api, queryStore.mind.mind, grain);

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

  const records = await saveRecord(
    api,
    queryStore.mind.mind,
    new URLSearchParams(queryStore.searchParams).get("_"),
    queryStore.recordSet,
    recordOld,
    recordNew,
  );

  try {
    const syncResult = await resolve(api, queryStore.mind.mind);

    setProxyStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
        state.syncError = undefined;
      }),
    );
  } catch (e) {
    // sync is best-effort after local save — surface but don't throw
    console.error("sync after save failed:", e);
    setQueryStore("syncError", e?.message ?? String(e));
  }

  const keyNew = recordNew[recordNew._];

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

  const records = await wipeRecord(
    api,
    queryStore.mind.mind,
    new URLSearchParams(queryStore.searchParams).get("_"),
    queryStore.recordSet,
    record,
  );

  try {
    const syncResult = await resolve(api, queryStore.mind.mind);

    setProxyStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
        state.syncError = undefined;
      }),
    );
  } catch (e) {
    // sync is best-effort after local delete — surface but don't fail
    console.error("sync after delete failed:", e);
    setProxyStore("syncError", e?.message ?? String(e));
  }

  setQueryStore(
    produce((state) => {
      state.recordSet = records;
      state.recordMap[record] = undefined;
    }),
  );

  setQueryStore("loading", false);
}

export async function onCancel() {
  await proxyStore.abortPreviousStream();

  setQueryStore("loading", false);
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch(api) {
  setQueryStore("loading", true);

  setProxyStore("streamCounter", queryStore.streamCounter + 1);

  try {
    // if search bar can be parsed as url, clone
    const url = new URL(queryStore.searchBar);

    if (url.protocol === "http:" || url.protocol === "https:") {
      const searchString = url.hash.replace("#", "");

      // reset searchbar to avoid a loop
      // after onMindChange calls onSearch
      setQueryStore(
        produce((state) => {
          state.searchBar = "";
        }),
      );

      await onMindChange(api, "/", searchString);

      setQueryStore("loading", false);

      return undefined;
    }
  } catch (e) {
    console.log(e);
    // do nothing
  }

  const url = makeURL(
    new URLSearchParams(queryStore.searchParams),
    queryStore.mind.mind,
  );

  window.history.replaceState(null, null, url);

  // TODO: reset loading on the end of the stream
  try {
    const { abortPreviousStream, startStream } = await selectStream(
      api,
      queryStore.schema,
      queryStore.mind.mind,
      appendRecord,
      new URLSearchParams(queryStore.searchParams),
      proxyStore.streamCounter,
    );

    // stop previous stream
    await proxyStore.abortPreviousStream();

    setProxyStore(
      produce((state) => {
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => () => {
          return abortPreviousStream();
        };
      }),
    );

    setQueryStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );

    // start appending records
    await startStream();

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
 * This
 * @name onMindChange
 * @export function
 * @param {String} pathname -
 * @param {String} searchString -
 */
export async function onMindChange(api, pathname, searchString) {
  // try to stop the stream before changing minds
  await proxyStore.abortPreviousStream();

  // TODO somewhere here in case of error doesn't change url to root
  setQueryStore(
    produce((state) => {
      // this updates the overview on change of params
      // and removes focus from the filter
      // erase searchParams to re-render the filter index
      state.searchParams = "";
      // erase records to re-render the overview
      state.recordSet = [];
    }),
  );

  let result;

  // in case of error fallback to root
  try {
    result = await changeMind(api, pathname, searchString);
  } catch (e) {
    console.error(e);

    result = await changeMind(api, "/", "_=mind");
  }

  const { mind, schema, searchParams } = result;

  try {
    const syncResult = await resolve(api, mind.mind);

    setProxyStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
        state.syncError = undefined;
      }),
    );
  } catch (e) {
    // sync is best-effort on navigation — surface but don't fail
    console.error("sync on mind change failed:", e);
    setProxyStore("syncError", e?.message ?? String(e));
  }

  setQueryStore(
    produce((state) => {
      state.mind = mind;
      state.schema = schema;
      state.searchParams = searchParams.toString();
    }),
  );

  const url = makeURL(searchParams, queryStore.mind.mind);

  window.history.replaceState(null, null, url);

  // only search by default in the root mind
  if (mind.mind === "root") {
    // start a search stream
    await onSearch(api);
  }
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

/**
 * This
 * @name onStartup
 * @export function
 */
export async function onStartup(api) {
  setQueryStore("loading", true);

  await createRoot(api);

  setQueryStore("loading", false);
}

export async function onMindOpen(api, mind) {
  const schema = await readSchema(api, mind);

  const base = await getDefaultBase(schema);

  await onMindChange(api, `/${mind}`, `_=${base}`);
}
