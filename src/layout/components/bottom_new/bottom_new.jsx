import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";
import { onRecordCreate } from "@/store/store.js";

export function BottomNew() {
  const { store, setStore } = useContext(Context);
  const { t } = useLingui();

  // if base is twig, it has no connections
  // we can add new values to csvs only if base has some connections
  const canAdd = () => {
    // store is set to undefined for a short moment to overwrite data
    if (store.schema === undefined || store.base === undefined)
      return false;

    return (
      store.schema[store.base] &&
      store.schema[store.base].leaves.length > 0
    );
  };
  return (
    <Show when={canAdd()} fallback={<></>}>
      <button
        className="bottomNew"
        onClick={() => onRecordCreate({ store, setStore })}
      >
        {t`new`}
      </button>
    </Show>
  );
}
