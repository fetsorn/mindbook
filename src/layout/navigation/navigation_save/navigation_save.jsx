import { useContext, createSignal } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordSave } from "@/store/store.js";

export function NavigationSave() {
  const { store, setStore, api } = useContext(Context);
  const { t } = useLingui();

  const [recordBackup] = createSignal(store.record);

  return (
    <button
      className="navigationSave"
      title={""}
      onClick={() =>
        onRecordSave({ store, setStore, api }, recordBackup(), store.record)
      }
    >
      {t`save`}
    </button>
  );
}
