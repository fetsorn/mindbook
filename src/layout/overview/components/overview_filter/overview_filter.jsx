import { useContext } from "solid-js";
import { useApi } from "@/context.js";
import {
  getFilterQueries,
  getFilterOptions,
  QueryContext,
  getSearchBar,
  onSearchBar,
} from "@/query/store.js";
import { onSearch } from "@/store/store.js";
import { Spoiler } from "@/layout/components/index.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const { store } = useContext(QueryContext);

  const api = useApi();

  return (
    <div>
      <input
        id="query"
        aria-label="query"
        value={getSearchBar(store.searchParams)}
        onInput={async (event) => {
          await onSearchBar(event.currentTarget.value);
        }}
      />

      <button
        onClick={async (event) => {
          await onSearch(api);
        }}
      >
        search
      </button>
    </div>
  );
}
