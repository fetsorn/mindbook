import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";

export function BottomSync() {
  const { store } = useContext(Context);
  const { t } = useLingui();

  return (
    <Show when={!store.mergeResult} fallback={<></>}>
      <span>{t`Conflict`}</span>
    </Show>
  );
}
