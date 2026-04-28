import { useContext, createSignal } from "solid-js";
import { useApi } from "@/context.js";
import { StoreContext, onRecordSave } from "@/store/index.js";

export function NavigationSave() {
  const { store } = useContext(StoreContext);

  const api = useApi();

  const [recordBackup] = createSignal(store.record);

  return (
    <button
      className="navigationSave"
      title={""}
      onClick={() => onRecordSave(api, recordBackup(), store.record)}
    >
      save
    </button>
  );
}
