import { useContext } from "solid-js";
import { Context, onCancel } from "@/store/store.js";
import { Confirmation } from "@/layout/components/index.js";

export function BottomLoader() {
  const { store } = useContext(Context);

  return (
    <Show when={store.loading} fallback={<></>}>
      <span>Loading...</span>

      <Confirmation
        action={`cancel`}
        question={"really cancel?"}
        onAction={() => onCancel()}
      />
    </Show>
  );
}
