import { useContext } from "solid-js";
import { useLingui } from "@lingui/solid";
import { Context, onRecordEdit } from "@/store/store.js";

export function NavigationRevert() {
  const context = useContext(Context);
  const { _ } = useLingui();

  return (
    <button
      className="navigationRevert"
      title={""}
      onClick={() => onRecordEdit(context, ["record"], undefined)}
    >
      {_({ id: "button.revert", message: "revert" })}
    </button>
  );
}
