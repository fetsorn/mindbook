import { useContext, For } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onChain, branchTitle } from "@/store/store.js";
import styles from "./menu_chain.module.css";

export function MenuChain(props) {
  const { store, setStore, api } = useContext(Context);
  const { i18n, t } = useLingui();

  const chainOptions = () =>
    store.schema[store.base] ? store.schema[store.base].leaves : [];

  return (
    <div id="menuChain" className={styles.dropdown}>
      <label id="labelChain" for="selectChain">
        {t`chain:`}
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
          {(field) => <option value={field}>{branchTitle(store.schema, field, i18n().locale)}</option>}
        </For>
      </select>
    </div>
  );
}
