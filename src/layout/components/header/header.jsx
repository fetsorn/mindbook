import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, branchTitle } from "@/store/store.js";

export function Header() {
  const { store } = useContext(Context);
  const { i18n } = useLingui();

  function capitalize(str) {
    if (str.length === 0) return undefined;

    return str[0].toUpperCase() + str.slice(1);
  }

  return (
    <h1>
      {capitalize(branchTitle(store.schema, store.base, i18n().locale)) ?? "Entries"}
    </h1>
  );
}
