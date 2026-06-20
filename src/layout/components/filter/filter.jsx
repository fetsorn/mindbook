import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, setQuery, onSearch } from "@/store/store.js";
import styles from "./filter.module.css";

export function Filter() {
  const context = useContext(Context);
  const { t } = useLingui();

  return (
    <div>
      <input
        id="query"
        aria-label="query"
        placeholder={t`search or filter with keyword:value`}
        value={context.store.query}
        onInput={(event) => {
          setQuery(context, event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearch(context);
          }
        }}
      />

      <button
        onClick={async () => {
          await onSearch(context);
        }}
      >
        {t`search`}
      </button>
    </div>
  );
}
