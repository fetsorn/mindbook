import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid/macro";
import { Context, onRecordEdit } from "@/store/store.js";

export function NavigationRevert() {
  const context = useContext(Context);
  const { t } = useLingui();

  return (
    <button
      className="navigationRevert"
      title={""}
      onClick={() => onRecordEdit(context, ["record"], undefined)}
    >
      {t`revert`}
    </button>
  );
}
