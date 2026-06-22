import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onCancel } from "@/store/store.js";
import { Confirmation } from "@/layout/components/index.js";

export function BottomStatus() {
  const { store } = useContext(Context);
  const { t } = useLingui();

  return (
    <Show when={store.status}>
      <span>{store.status}</span>

      <Confirmation
        action={t`cancel`}
        question={t`really cancel?`}
        onAction={() => onCancel()}
      />
    </Show>
  );
}
