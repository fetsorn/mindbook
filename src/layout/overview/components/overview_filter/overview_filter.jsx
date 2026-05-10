import { useContext } from "solid-js";
import { Context, setQuery, onSearch } from "@/store/store.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const context = useContext(Context);

  return (
    <div>
      <input
        id="query"
        aria-label="query"
        placeholder="search or filter with keyword:value"
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
        search
      </button>
    </div>
  );
}
