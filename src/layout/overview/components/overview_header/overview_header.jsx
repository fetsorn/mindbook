import { useContext } from "solid-js";
import { ProxyContext } from "@/proxy/store.js";

export function OverviewHeader() {
  const { store } = useContext(ProxyContext);

  function capitalize(str) {
    if (str.length === 0) return undefined;

    return str[0].toUpperCase() + str.slice(1);
  }

  return <h1>{capitalize(store.mind.name) ?? "Entries"}</h1>;
}
