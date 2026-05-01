import { useContext, createSignal } from "solid-js";
import { useApi } from "@/context.js";
import { QueryContext, onRecordSave } from "@/query/store.js";

export function NavigationSave() {
  const { store } = useContext(QueryContext);

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
