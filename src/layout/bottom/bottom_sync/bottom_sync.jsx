import { useContext } from "solid-js";
import { Context } from "@/store/store.js";

export function BottomSync() {
  const { store } = useContext(Context);

  return (
    <Show when={!store.mergeResult} fallback={<></>}>
      <span>Conflict</span>
    </Show>
  );
}
