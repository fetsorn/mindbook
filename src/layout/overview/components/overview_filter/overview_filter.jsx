import { useContext } from "solid-js";
import { Context, getSearchBar, onSearchBar, onSearch } from "@/store/store.js";
import { Spoiler } from "@/layout/components/index.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const context = useContext(Context);

  return (
    <div>
      <input
        id="query"
        aria-label="query"
        value={getSearchBar(context, context.store.searchParams)}
        onInput={async (event) => {
          await onSearchBar(context, event.currentTarget.value);
        }}
      />

      <button
        onClick={async (event) => {
          await onSearch(context);
        }}
      >
        search
      </button>
    </div>
  );
}
