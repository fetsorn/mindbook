import { deleteRecord, resolve } from "@/proxy/record.js";

import { buildRecord } from "@/proxy/impure.js";
import { setProxyStore, onMindChange } from "@/proxy/store.js";

// next is update, then select

async function c(api) {}

async function r(api, mind, record) {
  try {
    // if search bar can be parsed as url, clone
    const url = new URL(search);

    if (url.protocol === "http:" || url.protocol === "https:") {
      const searchString = url.hash.replace("#", "");

      //// reset searchbar to avoid a loop
      //// after onMindChange calls onSearch
      //setQueryStore(
      //  produce((state) => {
      //    state.searchBar = "";
      //  }),
      //);

      await onMindChange(api, "/", search);

      return undefined;
    }

    const url = makeURL(new URLSearchParams(search), queryStore.mind.mind);

    window.history.replaceState(null, null, url);
  } catch (e) {
    console.log(e);
    // do nothing
  }
}

async function u(api, mind, record) {
  await updateRecord(api, mind, base, recordNew);

  try {
    const syncResult = await resolve(api, mind);

    setProxyStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
        state.syncError = undefined;
      }),
    );
  } catch (e) {
    // sync is best-effort after local save — surface but don't throw
    console.error("sync after save failed:", e);
    setProxyStore("syncError", e?.message ?? String(e));
  }
}

async function d(api, mind, record) {
  await deleteRecord(api, mind, record);

  try {
    const syncResult = await resolve(api, mind);

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
}

async function describe(api, mind, record) {
  return buildRecord(api, queryStore.mind.mind, grain);
}

// currying for convenience
export default (provider) => {
  return {
    c: async () => c(provider),
    r: async () => r(provider),
    u: async () => u(provider),
    d: async (mind, record) => d(provider, mind, record),
    describe: async (mind, record) => describe(provider, mind, record),
  };
};
