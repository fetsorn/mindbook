import { useContext } from "solid-js";
import { Context } from "@/store/store.js";

export function BottomCount() {
  const { store } = useContext(Context);

  return <span>found {store.recordSet.length} </span>;
}
