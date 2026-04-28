import { useContext } from "solid-js";
import { useApi } from "@/context.js";
import { StoreContext, onMindChange } from "@/store/index.js";

export function NavigationBack() {
  const { store } = useContext(StoreContext);

  const api = useApi();

  return (
    <Show when={store.mind.mind !== "root"} fallback={<span></span>}>
      <button
        className="navigationBack"
        onClick={() => onMindChange(api, "/", "_=mind")}
      >
        back
      </button>
    </Show>
  );
}
