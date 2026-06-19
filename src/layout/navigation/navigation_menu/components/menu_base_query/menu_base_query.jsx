import { useContext, For } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onBase, branchTitle } from "@/store/store.js";
import styles from "./menu_base_query.module.css";

export function MenuBaseQuery(props) {
  const { store, setStore } = useContext(Context);
  const { i18n, t } = useLingui();

  return (
    <div id="menuBase" className={styles.dropdown}>
      <label id="labelBase" for="selectBase">
        {t`base:`}
      </label>

      <select
        id="selectBase"
        className={styles.select}
        value={store.base}
        onChange={({ target: { value } }) => onBase({ store, setStore }, value)}
      >
        <For each={Object.keys(store.schema)}>
          {(field) => <option value={field}>{branchTitle(store.schema, field, i18n().locale)}</option>}
        </For>
      </select>
    </div>
  );
}
