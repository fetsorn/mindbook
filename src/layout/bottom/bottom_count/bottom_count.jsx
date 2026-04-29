import { useContext } from "solid-js";
import { QueryContext } from "@/query/store.js";

export function BottomCount() {
  const { store } = useContext(QueryContext);

  return <span>found {store.recordSet.length} </span>;
}
