import { useContext, createSignal } from "solid-js";
import { Context, onRecordSave } from "@/store/store.js";

export function NavigationSave() {
  const { store, setStore, api } = useContext(Context);

  const [recordBackup] = createSignal(store.record);

  return (
    <button
      className="navigationSave"
      title={""}
      onClick={() =>
        onRecordSave({ store, setStore, api }, recordBackup(), store.record)
      }
    >
      save
    </button>
  );
}
