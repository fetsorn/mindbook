import { useContext } from "solid-js";
import { useApi } from "@/context.js";
import { onRecordCreate } from "@/store/store.js";
import { QueryContext } from "@/query/store.js";

export function BottomNew() {
  const { store } = useContext(QueryContext);

  const api = useApi();

  // if base is twig, it has no connections
  // we can add new values to csvs only if base has some connections
  const canAdd = () => {
    // store is set to undefined for a short moment to overwrite data
    if (store.schema === undefined || store.searchParams === undefined)
      return false;

    return (
      store.schema[new URLSearchParams(store.searchParams).get("_")] &&
      store.schema[new URLSearchParams(store.searchParams).get("_")].leaves
        .length > 0
    );
  };
  return (
    <Show when={canAdd()} fallback={<></>}>
      <button className="bottomNew" onClick={() => onRecordCreate(api)}>
        new
      </button>
    </Show>
  );
}
