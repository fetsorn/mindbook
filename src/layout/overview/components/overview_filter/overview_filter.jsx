import { getFilterQueries, getFilterOptions } from "@/store/index.js";
import { useContext } from "solid-js";
import { useApi } from "@/context.js";
import {
  StoreContext,
  onSearchBar,
  getSearchBar,
  onSearch,
} from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const { store } = useContext(StoreContext);

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
