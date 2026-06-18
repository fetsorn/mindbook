import { useContext, For } from "solid-js";
import { Context, onChain } from "@/store/store.js";
import styles from "./menu_chain_query.module.css";

export function MenuChainQuery(props) {
  const { store, setStore, api } = useContext(Context);

  const chainOptions = () =>
    store.schema[store.base] ? store.schema[store.base].leaves : [];

  return (
    <div id="menuChain" className={styles.dropdown}>
      <label id="labelChain" for="selectChain">
        chain:
      </label>

      <select
        id="selectChain"
        className={styles.select}
        value={store.chainBy ?? ""}
        onChange={({ target: { value } }) =>
          onChain({ store, setStore, api }, value)
        }
      >
        <option value="">—</option>

        <For each={chainOptions()}>
          {(field) => <option value={field}>{field}</option>}
        </For>
      </select>
    </div>
  );
}
