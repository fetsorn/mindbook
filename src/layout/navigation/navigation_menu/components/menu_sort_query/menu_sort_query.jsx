import { useContext, For, Show } from "solid-js";
import { useLingui } from "@lingui/solid";
import { Context, onSort } from "@/store/store.js";
import styles from "./menu_sort_query.module.css";

export function MenuSortQuery(props) {
  const { store, setStore } = useContext(Context);
  const { _ } = useLingui();

  return (
    <div id="menuSort" className={styles.dropdown}>
      <label id="labelSort" for="selectSort">
        {_({ id: "label.sort", message: "sort:" })}
      </label>

      <select
        id="selectSort"
        className={styles.select}
        value={store.sortBy}
        onChange={({ target: { value } }) =>
          onSort({ store, setStore }, ".sortBy", value)
        }
      >
        <For
          each={Object.keys(store.schema)
            .filter((branch) =>
              store.schema[branch].trunks.includes(store.base),
            )
            .concat([store.base])}
        >
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>

      <Show
        when={store.sortDirection === "last"}
        fallback={
          <button
            id="sortDirectionFirst"
            onClick={() => onSort({ store, setStore }, ".sortDirection", "last")}
          >
            ▲
          </button>
        }
      >
        <button
          id="sortDirectionLast"
          onClick={() => onSort({ store, setStore }, ".sortDirection", "first")}
        >
          ▼
        </button>
      </Show>
    </div>
  );
}
