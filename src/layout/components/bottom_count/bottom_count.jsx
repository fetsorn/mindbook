import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context } from "@/store/store.js";

export function BottomCount() {
  const { store } = useContext(Context);
  const { t } = useLingui();

  return <span aria-label="found">{t`found ${store.recordSet.length}`} </span>;
}
