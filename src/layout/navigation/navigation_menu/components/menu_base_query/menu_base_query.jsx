import { useContext, For } from "solid-js";
import { Context, onBase } from "@/store/store.js";
import styles from "./menu_base_query.module.css";

export function MenuBaseQuery(props) {
  const { store, setStore } = useContext(Context);

  return (
    <div id="menuBase" className={styles.dropdown}>
      <label id="labelBase" for="selectBase">
        base:
      </label>

      <select
        id="selectBase"
        className={styles.select}
        value={new URLSearchParams(store.searchParams).get("_")}
        onChange={({ target: { value } }) => onBase({ store, setStore }, value)}
      >
        <For each={Object.keys(store.schema)}>
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>
    </div>
  );
}
