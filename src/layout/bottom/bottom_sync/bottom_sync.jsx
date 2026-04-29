import { useContext } from "solid-js";
import { QueryContext } from "@/query/store.js";

export function BottomSync() {
  const { store } = useContext(QueryContext);

  return (
    <Show when={!store.mergeResult} fallback={<></>}>
      <span>Conflict</span>
    </Show>
  );
}
