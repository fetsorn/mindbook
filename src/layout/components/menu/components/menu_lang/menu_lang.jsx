import { useLingui } from "@lingui/solid/macro";
import { loadCatalog, locales } from "@/i18n.js";
import styles from "./menu_lang.module.css";

export function MenuLang() {
  const { i18n, t } = useLingui();

  async function onChange(locale) {
    await loadCatalog(locale, i18n());
  }

  return (
    <div id="menuLang" className={styles.dropdown}>
      <label id="labelLang" for="selectLang">
        {t`lang:`}
      </label>

      <select
        id="selectLang"
        className={styles.select}
        value={i18n().locale}
        onChange={({ target: { value } }) => onChange(value)}
      >
        <For each={Object.entries(locales)}>
          {([code, name]) => <option value={code}>{name}</option>}
        </For>
      </select>
    </div>
  );
}
