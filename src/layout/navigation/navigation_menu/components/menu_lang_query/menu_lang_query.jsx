import { useLingui } from "@lingui/solid";
import { locales } from "@/i18n.js";
import styles from "./menu_lang_query.module.css";

export function MenuLangQuery() {
  const { i18n, _ } = useLingui();

  async function onChange(locale) {
    const { messages } = await import(
      `../../../../../locales/${locale}/messages.js`
    );

    i18n().load(locale, messages);
    i18n().activate(locale);
  }

  return (
    <div id="menuLang" className={styles.dropdown}>
      <label id="labelLang" for="selectLang">
        {_({ id: "label.lang", message: "lang:" })}
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
